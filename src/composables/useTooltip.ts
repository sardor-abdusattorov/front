import { TicketSessionList } from '@/services/ticket/model/ticker.model'
import { formatMoney } from '@/utils/functions'
import '@/styles/tooltip.scss'
import { useI18n } from 'vue-i18n'

export const useTooltip = () => {
  const { t } = useI18n()

  function renderTooltip(element: SVGGElement, info?: TicketSessionList, className?: string) {
    const sector = element.getAttribute('data-sector')
    const row = element.getAttribute('data-row')
    const seatNumber = element.getAttribute('data-seat')

    const tooltipContent = `<div class='seat-info'>
      <ul>
        <li>${t('report.statisticsTicket.sector')} ${sector}</li>
        <li>${t('report.statisticsTicket.row')} ${row} ${t('report.statisticsTicket.place')} ${seatNumber}</li>
        ${info ? `<li>${info.price === 0 ? t('report.statisticsTicket.invitationTicket') : formatMoney(info.price)} UZS</li>` : ''}
      </ul>
    </div>`

    element.addEventListener('mouseenter', (event) => showTooltip(event, tooltipContent, className))
    element.addEventListener('mouseleave', () => hideTooltip(className))
  }

  function showTooltip(event: MouseEvent, content: string, className?: string) {
    let tooltip = document.querySelector('.tooltip') as HTMLElement

    if (!tooltip) {
      tooltip = document.createElement('div')
      tooltip.className = 'tooltip'
      if (className) {
        const parent = document.querySelector(`.${className}`) as HTMLElement
        parent.appendChild(tooltip)
      } else {
        document.body.appendChild(tooltip)
      }
    }

    tooltip.innerHTML = content
    tooltip.style.display = 'block'

    tooltip.style.left = `${event.pageX + 10}px`
    tooltip.style.top = `${event.pageY + 10}px`
  }

  function hideTooltip(className?: string) {
    const tooltip = document.querySelector('.tooltip') as HTMLElement
    if (tooltip) {
      tooltip.style.display = 'none'
      if (className) {
        const parent = document.querySelector(`.${className}`) as HTMLElement
        parent.removeChild(tooltip)
      } else {
        document.body.removeChild(tooltip)
      }
    }
  }

  return {
    renderTooltip
  }
}
