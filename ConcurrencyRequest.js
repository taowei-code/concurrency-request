export default class ConcurrencyRequest {
  constructor({ maxConcurrencyCount }) {
    this.maxConcurrencyCount = maxConcurrencyCount
    this.taskQueue = []
    this.response = {}
    setTimeout(() => {
      // 利用异步任务后置调用，等任务都推进来再执行
      this.doRequest()
    });
  }
  push(task) {
    this.taskQueue.push(task)
  }
  doRequest() {
    if (!this.taskQueue.length) return
    // 处理任务数量少于最大并发数的情况
    const minConcurrencyCount = getMinCount(this.taskQueue.length, this.maxConcurrencyCount)
    for (let i = 0; i < minConcurrencyCount; i++) {
      const task = this.taskQueue.shift()
      this.maxConcurrencyCount--
      this.runTask(task)
    }
  }
  runTask(task) {
    task().then(res => {
      this.response[task.name] = {
        res,
        err: null
      }
    }).catch(err => {
      this.response[task.name] = {
        res: null,
        err
      }
    }).finally(() => {
      this.maxConcurrencyCount++
      this.doRequest()
    })
  }
}
function getMinCount(count1, count2) {
  return Math.min(count1, count2)
}