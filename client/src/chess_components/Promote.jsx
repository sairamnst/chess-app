import React from 'react'
import Square from './Square'
import {move} from './Game'
const promotionPieces=['r','n','b','q']
export default function Promote({
    promotion:{from,to,color},
}) {

  return (
    <div className='board'>
        {promotionPieces.map((p,i)=>(
            <div key={i} className='promote-square'>
                <Square black={i%3===0}>
                    <div className='piece-container' onClick={()=>move(from,to,p)}>
                        <img src={`../../src/assets/${p}_${color}.svg`} alt="" className='piece cursor-pointer'/>
                    </div>
                </Square>
            </div>
        ))}
    </div>
  )
}
