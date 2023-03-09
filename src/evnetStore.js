import { EventEmitter } from 'events'

class EventStore extends EventEmitter {
  constructor() {
    super()
  }
}

const store = new EventStore()
window.eventStore = store
export default store
