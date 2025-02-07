export interface WebSocketBaseEvent<T, D> {
  type: T
  data: D
}

// Thanks to:
//
// A little hack for creating extensible discriminated unions : r/typescript
// https://www.reddit.com/r/typescript/comments/1064ibt/a_little_hack_for_creating_extensible/
export interface WebSocketEvents {
  'error': {
    message: string
  }
  'module:authenticate': {
    userId: string
  }
  'module:authenticated': {
    authenticated: boolean
  }
  'input:voice': {
    audio: ArrayBuffer
  }
}

export type WebSocketEvent = {
  [K in keyof WebSocketEvents]: WebSocketBaseEvent<K, WebSocketEvents[K]>;
}[keyof WebSocketEvents]
