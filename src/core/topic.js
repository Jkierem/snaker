import React from "react"
import { Observable } from "jazzi-observable"

export const Topic = () => {
    let count = 0
    let subs = []
    const subscribers = {
        add(sub){
            const id = count++;
            subs.push({ id, sub })
            return id;
        },
        remove(id){
            subs = subs.filter(s => s.id !== id);
        },
        forEach(fn){
            subs.forEach(({ sub }) => fn(sub))
        }
    }
    const subObs = Observable.from((sub) => {
        const ticket = subscribers.add(sub)
        return () => {
            subscribers.remove(ticket)
        }
    })
    return {
        subscribe(...args){
            return subObs.subscribe(...args)
        },
        emit(event,data){
            subscribers.forEach(s => s.next({
                event,
                data,
            }))
        }
    }
}

export const TopicContext = React.createContext({
    emit: (event,data) => {},
    subscribe: () => {}
})