import { Navbar,Footer,Services,Loader,Transactions,Welcome} from "../components";
import React, { useEffect, useState } from 'react'
import { gameSubject, initGame, resetGame } from '../chess_components/Game'
import Board from '../chess_components/Board'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import MovesTable from "../chess_components/MovesTable";

function GameApp() {
  const [board, setBoard] = useState([])
  const [isGameOver, setIsGameOver] = useState()
  const [result, setResult] = useState()
  const [position, setPosition] = useState()
  const [initResult, setInitResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [moves, setMoves]= useState([])
  const [game, setGame] = useState({})
  const { id } = useParams()
  const navigate = useNavigate()
  const sharebleLink = window.location.href
  useEffect(() => {
    let subscribe
    async function init() {
      const res = await initGame((id !== 'local' && id !== 'computer') ? db.doc(`games/${id}`) : id)
      setInitResult(res)
      setLoading(false)
      if (!res) {
        subscribe = gameSubject.subscribe((game) => {
          setBoard(game.board)
          setIsGameOver(game.isGameOver)
          setResult(game.result)
          setPosition(game.position)
          setStatus(game.status)
          setGame(game)
          setMoves(game.moves)
        })

      }

    }

    init()

    return () => subscribe && subscribe.unsubscribe()
  }, [id])

  async function copyToClipboard() {
    await navigator.clipboard.writeText(sharebleLink)
  }

  if (loading) {
    return 'Loading ...'
  }
  if (initResult === 'notfound') {
    return 'Game Not found'
  }

  if (initResult === 'intruder') {
    return 'The game is already full'
  }

  return (
    <div className="min-h-screen">
      <div className="gradient-bg-welcome">
        <Navbar/>
        <div className="app-container">
          {isGameOver && (
            <h2 className="vertical-text">
              GAME OVER
              <button onClick={async () => {
                await resetGame()
                navigate('/game-select')
              }}>
                <span className="vertical-text"> NEW GAME</span>
              </button>
            </h2>
          )}
          <div className="board-container">
            {game.oponent && game.oponent.name && <span className="tag is-link">{game.oponent.name}</span>}
            <Board board={board} position={position} />
            {game.member && game.member.name && <span className="tag is-link">{game.member.name}</span>}
          </div>
          {result && <p className="vertical-text">{result}</p>}
          {status !== 'waiting' && status!=='over' && (
            <div className="pl-10">
              <MovesTable moves={moves} />
            </div>
          )}
          {status === 'waiting' && (
            <div className="notification is-link share-game">
              <strong>Share this game to continue</strong>
              <br />
              <br />
              <div className="field has-addons">
                <div className="control is-expanded">
                  <input type="text" name="" id="" className="input" readOnly value={sharebleLink} />
                </div>
                <div className="control">
                  <button className="button is-info" onClick={copyToClipboard}>Copy</button>
                </div>
              </div>
            </div>
          )}

        </div>
        <Footer/>
      </div>
    </div>
  )
}

export default GameApp