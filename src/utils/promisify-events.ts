import { EventEmitter } from 'stream'

export const promisifyEvents = (successEvents: string[], failureEvents: string[], timeoutMs = 0) =>
  (eventEmitter: EventEmitter) => {
    return new Promise<void>((resolve, reject) => {
      let timeout: NodeJS.Timeout

      const clean = () => {
        clearTimeout(timeout)
        successEvents.forEach((event) => eventEmitter.removeListener(event, onSuccess))
        failureEvents.forEach((event) => eventEmitter.removeListener(event, onFailure))
      }

      const onSuccess = () => {
        resolve()
        clean()
      }

      const onFailure = (error: Error) => {
        reject(error)
        clean()
      }

      const onTimeout = () => {
        const error = new Error('Timed out')
        onFailure(error)
      }

      successEvents.forEach((event) => eventEmitter.on(event, onSuccess))
      failureEvents.forEach((event) => eventEmitter.on(event, onFailure))
      if (timeoutMs > 0) {
        timeout = setTimeout(onTimeout, timeoutMs)
      }
    })
  }