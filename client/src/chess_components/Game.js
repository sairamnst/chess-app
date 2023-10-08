import { Chess } from 'chess.js'
import { BehaviorSubject } from 'rxjs'
import { map } from 'rxjs/operators'
import { auth } from '../firebase'
import { fromDocRef } from 'rxfire/firestore'

let gameRef
let member

const chess = new Chess()

export let gameSubject

export async function initGame(gameRefFb) {
    const { currentUser } = auth
    if (gameRefFb==='local') {
        gameRef = null
        gameSubject = new BehaviorSubject()
        const savedGame = localStorage.getItem('savedGame')
        if (savedGame) {
            chess.load(savedGame)
        }
        updateGame()
    }
    else if (gameRefFb==='computer') {
        gameRef = 'computer'
        gameSubject = new BehaviorSubject()
        chess.reset()
        updateGame()
    }
    else {
        gameRef = gameRefFb
        const initialGame = await gameRefFb.get().then(doc => doc.data())
        if (!initialGame) {
            return 'notfound'
        }
        const creator = initialGame.members.find(m => m.creator === true)

        if (initialGame.status === 'waiting' && creator.uid !== currentUser.uid) {
            const currUser = {
                uid: currentUser.uid,
                name: localStorage.getItem('userName'),
                piece: creator.piece === 'w' ? 'b' : 'w'
            }
            const updatedMembers = [...initialGame.members, currUser]
            await gameRefFb.update({ members: updatedMembers, status: 'ready' })

        } else if (!initialGame.members.map(m => m.uid).includes(currentUser.uid)) {
            return 'intruder'
        }
        chess.reset()

        gameSubject = fromDocRef(gameRefFb).pipe(
            map(gameDoc => {
                const game = gameDoc.data()
                const { pendingPromotion, gameData, ...restOfGame } = game
                member = game.members.find(m => m.uid === currentUser.uid)
                const oponent = game.members.find(m => m.uid !== currentUser.uid)
                if (gameData) {
                    chess.load(gameData)
                }
                const isGameOver = chess.game_over()
                return {
                    board: chess.board(),
                    pendingPromotion,
                    isGameOver,
                    position: member.piece,
                    member,
                    oponent,
                    result: isGameOver ? getGameResult() : null,
                    ...restOfGame
                }
            })
        )

    }

}

export async function resetGame() {
    if (gameRef && gameRef!='computer') {
        await updateGame(null, true)
        chess.reset()
    } else {
        chess.reset()
        updateGame()
    }

}

export function handleMove(from, to) {
    const promotions = chess.moves({ verbose: true }).filter(m => m.promotion)
    //console.table(promotions)
    let pendingPromotion
    if (promotions.some(p => `${p.from}:${p.to}` === `${from}:${to}`)) {
        pendingPromotion = { from, to, color: promotions[0].color }
        updateGame(pendingPromotion)
    }

    if (!pendingPromotion) {
        move(from, to)
    }
}


export function move(from, to, promotion) {
    let tempMove = { from, to }
    if (promotion) {
        tempMove.promotion = promotion
    }
    //console.log({ tempMove, member }, chess.turn())
    if (gameRef && gameRef!='computer') {
        if (member.piece === chess.turn()) {
            const legalMove = chess.move(tempMove)
            if (legalMove) {
                updateGame()
            }
        }
    } else {
        const legalMove = chess.move(tempMove)

        if (legalMove) {
            updateGame()
        }
    }

}

async function updateGame(pendingPromotion, reset) {
    const isGameOver = chess.isGameOver()
    if (gameRef && gameRef!='computer') {
        const updatedData = { gameData: chess.fen(), pendingPromotion: pendingPromotion || null }
        console.log({ updateGame })
        if (reset) {
            updatedData.status = 'over'
        }
        await gameRef.update(updatedData)
    } 
    
    else if (gameRef=='computer') {
        if (chess.turn()=='b'){
            const valid_moves=chess.moves()
            const valid_moves_verbose=chess.moves({verbose:true})
            const rand_index=(Math.floor(Math.random()*valid_moves.length))
            //console.log(MoveGenerationTest(3,chess));
            //console.log(orderMoves(valid_moves_verbose))
            //if (!chess.isGameOver()) chess.move(valid_moves[rand_index])
            let bestMove=bestMoveGenerator(valid_moves_verbose,3);
            if (!chess.isGameOver()) chess.move({ from: bestMove.from, to: bestMove.to })
        }
        const newGame = {
            board: chess.board(),
            pendingPromotion,
            isGameOver,
            position: chess.turn(),
            result: isGameOver ? getGameResult() : null
        }
        localStorage.setItem('savedGame', chess.fen())
        gameSubject.next(newGame)
    }
    
    else {
        const newGame = {
            board: chess.board(),
            pendingPromotion,
            isGameOver,
            position: chess.turn(),
            result: isGameOver ? getGameResult() : null
        }
        localStorage.setItem('savedGame', chess.fen())
        gameSubject.next(newGame)
    }


}
function getGameResult() {
    if (chess.isCheckmate()) {
        const winner = chess.turn() === "w" ? 'BLACK' : 'WHITE'
        return `CHECKMATE - WINNER - ${winner}`
    } else if (chess.isDraw()) {
        let reason = '50 - MOVES - RULE'
        if (chess.isStalemate()) {
            reason = 'STALEMATE'
        } else if (chess.isThreefoldRepetition()) {
            reason = 'REPETITION'
        } else if (chess.isInsufficientMaterial()) {
            reason = "INSUFFICIENT MATERIAL"
        }
        return `DRAW - ${reason}`
    } else {
        return 'UNKNOWN REASON'
    }
}

function MoveGenerationTest(depth,chess) {
    const chessTemp=new Chess();
    chessTemp.load(chess.fen());
    if (depth==0) {
        return 1;
    }
    let moves=chessTemp.moves();
    let numPositions=0;
    for (let move in moves) {
        chessTemp.move(move);
        numPositions+=MoveGenerationTest(depth-1,chessTemp);
        chessTemp.undo();
    }
    return numPositions;
}

let pawnValue=100
let knightValue=300
let bishopValue=300
let queenValue=900
let rookValue=500
let endgameMaterialStart=rookValue*2+bishopValue+knightValue;

function getPieceValue(capturePieceType){
    if (capturePieceType==='r') {
        return rookValue;
    }
    if (capturePieceType==='n') {
        return knightValue;
    }
    if (capturePieceType==='b') {
        return bishopValue;
    }
    if (capturePieceType==='q') {
        return queenValue;
    }
    if (capturePieceType==='p') {
        return pawnValue;
    }
}

function CountMaterial(chessTemp,colour) {
    let material=0
    const board=chessTemp.board()
    for (let i=0;i<8;i++) {
        for (let j=0;j<8;j++) {
            //console.log(getPieceValue(board[i][j].type))
            if (board[i][j]!==null && board[i][j].color===colour && getPieceValue(board[i][j].type)!=undefined) {
                material+=getPieceValue(board[i][j].type);
                /*if (board[i][j].type==='r') {
                    material+=rookValue;
                }
                if (board[i][j].type==='n') {
                    material+=knightValue;
                }
                if (board[i][j].type==='b') {
                    material+=bishopValue;
                }
                if (board[i][j].type==='q') {
                    material+=queenValue;
                }
                if (board[i][j].type==='p') {
                    material+=pawnValue;
                }*/
            }
        }
    }
    return material;
}

function Evaluate(chessTemp) {
    let whiteEval=CountMaterial(chessTemp,'w')
    let blackEval=CountMaterial(chessTemp,'b')

    let Evaluation=whiteEval-blackEval
    let perspective=chessTemp.turn()==='w' ? 1 : -1
    return Evaluation*perspective
}

function search(depth,tempChess,alpha,beta) {
    if (depth==0) {
        // return Evaluate(tempChess);
        return searchAllCaptures(tempChess,alpha,beta);
    }

    //const tempChess=new Chess();
    //tempChess.load(chess.fen());
    let moves=tempChess.moves();
    if (moves.length==0) {
        if (tempChess.inCheck()) {
            return -Infinity;
        }
        return 0;
    }
    for (let i=0;i<moves.length;i++) {
        let move=moves[i]
        tempChess.move(move);
        let evaluation=-search(depth-1,tempChess,-beta,-alpha);
        tempChess.undo();
        if (evaluation>=beta) {
            return beta;
        }
        alpha=Math.max(alpha,evaluation);
    }
    return alpha;
}

function orderMoves(tempChess,moves) {
    let indexScorePair=new Map();
    let move
    for (let i=0;i<moves.length;i++) {
        move=moves[i]
        let moveScoreGuess=0;
        let movePieceType=move.piece;
        let capturePieceType=move.captured;
        tempChess.move({from:move.from,to:move.to})
        if (tempChess.inCheck()) {
            moveScoreGuess+=20;
        }
        tempChess.undo();
        if (capturePieceType!==undefined) {
            if (movePieceType=='k') {
                moveScoreGuess+=getPieceValue(capturePieceType);
            }
            else {
                moveScoreGuess+=getPieceValue(capturePieceType)-getPieceValue(movePieceType);    
            }
            //moveScoreGuess=10*getPieceValue(capturePieceType)-getPieceValue(movePieceType);
        }
        if (move.promotion!==undefined) {
            moveScoreGuess+=getPieceValue(move.promotion);
        }
        //penalize target square that is attacked by a pawn
        let toMove=move.to;
        let attack_square1=undefined;
        let attack_square2=undefined;
        if (String.fromCharCode(toMove.charCodeAt(0)-1)>='a' &&
            String.fromCharCode(toMove.charCodeAt(1)-1>='1')) {
                attack_square1=String.fromCharCode(toMove.charCodeAt(0)-1)+String.fromCharCode(toMove.charCodeAt(1)-1);
        }
        if (String.fromCharCode(toMove.charCodeAt(0)+1)<='h' &&
            String.fromCharCode(toMove.charCodeAt(1)-1>='1')) {
                attack_square2=String.fromCharCode(toMove.charCodeAt(0)+1)+String.fromCharCode(toMove.charCodeAt(1)-1);
        }
        let attack1_piece=chess.get(attack_square1);
        let attack2_piece=chess.get(attack_square2)
        if ((attack1_piece.type==='p' && attack1_piece.color==='b')||(attack2_piece.type==='p' && attack2_piece.color==='b')) {
            // moveScoreGuess-=getPieceValue(movePieceType);
            moveScoreGuess-=350;
        }
        if (moveScoreGuess!=undefined) indexScorePair.set(move,moveScoreGuess);
    }
    /*indexScorePair=new Map([...indexScorePair.entries()].sort((a, b) => b[1] - a[1]));
    const [firstKey]=indexScorePair.keys();
    return firstKey;*/
    // console.log(indexScorePair.values())
    return indexScorePair;
}

function bestMoveGenerator(moves,depth) {
    const tempChess=new Chess();
    tempChess.load(chess.fen());
    let indexScore=orderMoves(tempChess,moves);
    // console.log(indexScore)
    
    for (let [key,value] of indexScore) {
        tempChess.move({from:key.from,to:key.to});
        let a_b_pruning=search(depth,tempChess,-Infinity,Infinity)
        let king_to_corner=forceKingToCornerEndgameEval(tempChess);
        indexScore.set(key,value+a_b_pruning+king_to_corner);
        tempChess.undo();
        //console.log(indexScore)
    }
    indexScore=new Map([...indexScore.entries()].sort((a, b) => a[1] - b[1]));
    console.log(indexScore)
    const [firstKey]=indexScore.keys();
    return firstKey;
}

function searchAllCaptures(tempChess,alpha,beta) {
    let evaluation=Evaluate(tempChess);
    if (evaluation>=beta) {
        return beta;
    }
    alpha=Math.max(alpha,evaluation);
    let capture_moves_verbose=tempChess.moves({verbose:true}).filter(m=>m.captured);
    let ordered_moves=orderMoves(tempChess,capture_moves_verbose).keys();
    for (let i=0;i<ordered_moves.length;i++) {
        tempChess.move({from:ordered_moves[i].from,to:ordered_moves[i].to});
        evaluation=-searchAllCaptures(tempChess,-beta,-alpha);
        tempChess.undo();
        if (evaluation>=beta) {
            return beta;
        }
        alpha=Math.max(alpha,evaluation);
        
    }
    return alpha;
}

function EndgamePhaseWeight (materialCountWithoutPawns) {
	let multiplier = 1 / endgameMaterialStart;
	return 1-Math.min(1,materialCountWithoutPawns*multiplier);
}

function forceKingToCornerEndgameEval(tempChess) {
    let evaluation=0;
    let tempChessBoard=tempChess.board();
    let materialCountWithoutPawns=CountMaterial(tempChess,'b');
    let friendlyKingRank
    let friendlyKingFile
    let opponentKingRank
    let opponentKingFile
    for (let i=0;i<8;i++) {
        for (let j=0;j<8;j++) {
            if (tempChessBoard[i][j]!=null && tempChessBoard[i][j].type=='k') {
                if (tempChessBoard[i][j].color=='w') {
                    opponentKingRank=i;
                    opponentKingFile=j;
                }
                else {
                    friendlyKingRank=i;
                    friendlyKingFile=j;
                }
            }
            if (tempChessBoard[i][j]!=null && tempChessBoard[i][j].color=='b' && tempChessBoard[i][j].type=='p') {
                materialCountWithoutPawns-=pawnValue;
            }
        }
    }
    let opponentKingDstToCentreFile=Math.max(3-opponentKingFile,opponentKingFile-4);
    let opponentKingDstToCentreRank=Math.max(3-opponentKingRank,opponentKingRank-4);
    let opponentKingDstFromCentre=opponentKingDstToCentreFile+opponentKingDstToCentreRank;
    evaluation+=opponentKingDstFromCentre;

    let dstBetweenKingsFile=Math.abs(friendlyKingFile-opponentKingFile);
    let dstBetweenKingsRank=Math.abs(friendlyKingRank-opponentKingRank);
    let dstBetweenKings=dstBetweenKingsFile+dstBetweenKingsRank;
    evaluation+=14-dstBetweenKings;

    let endgameWeight=EndgamePhaseWeight(materialCountWithoutPawns);

    return Math.round(evaluation*10*endgameWeight);
}