import Vue3Toastify, { ToastTheme, type ToastContainerOptions } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const toastifyOptions: ToastContainerOptions = {
  position: 'top-right',
  autoClose: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  theme: (localStorage.getItem('theme') as ToastTheme) || 'light'
}

export { Vue3Toastify, toastifyOptions }
