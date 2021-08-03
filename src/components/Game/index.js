import React from 'react'
import gcn from 'getclassname';
import { BoxedEnumType, getVariant } from 'jazzi'
import { Matrix, Position } from '../../core/types';
import "./Game.scss"

const ExtTile = BoxedEnumType("ExtTile",["Empty","Fruit","Wall","Head","Body","Tail"])
const mapToBodyPart = (l) => (coord,idx,snake) => {
  if( idx === 0 ){
    const neck = Position.fromArray(snake[idx + 1])
    const head = Position.fromArray(coord)
    const direction = head.substract(neck).toDirection();
    return ExtTile.Head(direction)
  } else if (idx === l - 1){
    const preTail = Position.fromArray(snake[idx - 1])
    const tail = Position.fromArray(coord)
    const direction = preTail.substract(tail).toDirection();
    return ExtTile.Tail(direction)
  } else {
    const prev = Position.fromArray(snake[idx - 1])
    const curr = Position.fromArray(coord)
    const next = Position.fromArray(snake[idx + 1])
    const prevDir = curr.substract(prev).toDirection()
    const nextDir = next.substract(curr).toDirection()
    return ExtTile.Body([prevDir,nextDir])
  }
}

const WorldClass = gcn({ base: "world" });
const ColClass   = WorldClass.element("col");
const CellClass  = ColClass.element("cell");
const lowerVariant = x => getVariant(x).toLowerCase()

const Cell = ({ type }) => {
  const tile = getVariant(type) ? type : ExtTile.toEnum(type)
  const baseContent = CellClass.element("content")
  const contentCl = baseContent.recompute({
    "&--wall" : tile.isWall,
    "&--body" : tile.isBody,
    "&--head" : tile.isHead,
    "&--tail" : tile.isTail,
    "&--fruit": tile.isFruit,
  })
  return <div className={CellClass}>
    {tile.match({
      'Head | Tail': (dir) => {
        const orientedCl = baseContent
          .modifier(lowerVariant(tile))
          .modifier(lowerVariant(dir))
        return <div className={`${contentCl} ${orientedCl}`} />
      },
      'Body' : ([prevDir, nextDir]) => {
        const bodCl = (x,dir="") =>  `${contentCl}-${x} ${dir && lowerVariant(dir)}`
        return <>
          <div key="body-1" className={bodCl(1,prevDir)}/>
          <div key="body-2" className={bodCl(2)}/>
          <div key="body-3" className={bodCl(3,nextDir)}/>
        </>
      },
      "Fruit | Wall" : () => <div className={contentCl}/>,
      'default' : () => <></>
    })}
  </div>
}

const WorldCol = ({ col, x, isEven }) => {
  const colCl = ColClass.recompute({
    "&--even": isEven
  })

  return <div className={colCl} >
    {col.map((cellData, y) => {
      return <Cell key={`cell-${x}-${y}`} type={cellData} />
    })}
  </div>
}

const Game = ({ snake, world }) => {
  const worldCopy = Matrix.copy(world);
  snake
    .map(mapToBodyPart(snake.length))
    .map((part,idx) => [part, snake[idx]])
    .forEach(([part,coords]) => {
      const [x,y] = coords;
      worldCopy[x][y] = part;
    })
  return(
    <div className={WorldClass} >
      {worldCopy.map((col, x) => {
        return <WorldCol key={`col-${x}`} col={col} x={x} isEven={x % 2 === 0}/>
      })}
    </div>
  )
}

export default Game;