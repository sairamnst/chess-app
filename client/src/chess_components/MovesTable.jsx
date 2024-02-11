import React from 'react'

const moves = [
    { name: "Anom", age: 19, gender: "Male" },
    { name: "Megha", age: 19, gender: "Female" },
    { name: "Subham", age: 25, gender: "Male" },
]

const MovesTable = ({moves,...props}) => {
    console.log(moves)
  return (
    <div>
        <table>
            <tr>
                <th>Move</th>
                <th>White</th>
                <th>Black</th>
            </tr>
            {moves && moves.map((value,index)=>{
                if (index%2==0) {
                    return(
                        <tr>
                            <td>{index/2+1}</td>
                            <td>{value.san}</td>
                            {index<moves.length-1?<td>{moves[index+1].san}</td>:null}
                        </tr>
                    )
                }
            })}
        </table>
    </div>
  )
}

export default MovesTable