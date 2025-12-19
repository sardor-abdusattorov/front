import { defineStore } from 'pinia'

export const useCountDown = defineStore('countdown', () => {
  let countdownInterval = ref<number | undefined>(undefined)
  let countdown = ref({ isVisible: false, time: '' })

  function startCountdown(seconds: number) {
    let remainingSeconds = seconds

    if (countdownInterval !== undefined) {
      clearInterval(countdownInterval.value)
    }

    countdownInterval.value = setInterval(() => {
      countdown.value.isVisible = true
      const minutes = Math.floor(remainingSeconds / 60)
      const secs = remainingSeconds % 60

      countdown.value.time = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

      if (remainingSeconds === 0) {
        clearInterval(countdownInterval.value)
        window.location.reload()
      } else {
        remainingSeconds--
      }
    }, 1000)
  }

  return {
    countdownInterval,
    countdown,
    startCountdown
  }
})
