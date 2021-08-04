import React from 'react'
import gcn from 'getclassname';
import { getVariant, Maybe } from 'jazzi'
import { Matrix, Position, BoxedTile } from '../../core/types';
import "./Game.scss"

const WorldClass = gcn({ base: "world" });
const ColClass   = WorldClass.element("col");
const CellClass  = ColClass.element("cell");
const lowerVariant = x => getVariant(x).toLowerCase()

const Cell = ({ type }) => {
  const tile = getVariant(type) ? type : BoxedTile.toEnum(type)
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
    .map(BoxedTile.mapToBodyPart(snake.length))
    .map((part,idx) => [part, Position.fromArray(snake[idx])])
    .forEach(([part,pos]) => {
      Maybe
      .fromPredicate(() => !worldCopy.getTile(pos).isWall())
      .effect(() => worldCopy.setTile(pos,part))
    })
  return(
    <div className={WorldClass} >
      {worldCopy.get().map((col, x) => {
        return <WorldCol key={`col-${x}`} col={col} x={x} isEven={x % 2 === 0}/>
      })}
    </div>
  )
}

export default Game;