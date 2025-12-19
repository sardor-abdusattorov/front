import { useI18n } from 'vue-i18n'

import type { Navigator } from '@/services/navigation/navigation.interface'
import { PERMISSIONS } from '@/constants/permissions'
import { usePermissions } from '@/stores/permissions.store'
import { useUserStore } from '@/stores/user.store'
import { useCashierStore } from '@/stores/cashier.store'
import { getUserReports } from '@/services/dynamic-reports/dynamic-reports.service'
import { toast } from 'vue3-toastify'
import { getErrorMessage } from '@/utils/functions'
import { DynamicModel } from '@/services/dynamic-reports/model/dynamic-reports.model'
import { getCompanyByStructureId } from '@/services/organization/organization.service'
import { GetTourAgentInvoice } from '@/services/payment/payment.service'

export const useNavigators = () => {
  const { t, locale } = useI18n()
  const { hasPermission } = usePermissions()
  const store = useUserStore()
  const cashierStore = useCashierStore()
  const userReports = ref<DynamicModel[]>([])
  const orgCount = ref(0)

  const fetchUserReports = async () => {
    try {
      const { data } = await getUserReports()
      userReports.value = data.result
      createUserReports()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const fetchCompanyByStructureId = async () => {
    try {
      const {
        data: { result: newResult }
      } = await getCompanyByStructureId({ skip: 0, take: 10, statusId: 1, searchText: '' })
      const newCount = newResult.total

      const {
        data: { result: editedResult }
      } = await getCompanyByStructureId({ skip: 0, take: 10, statusId: 4, searchText: '' })
      const editedCount = editedResult.total

      navigators.value[0].notification = newCount + editedCount
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  const fetchPaymentTransactions = async () => {
    try{
      const {
        data: { result: newResult }
    } = await GetTourAgentInvoice({ skip: 0, take: 10, statusId: 1 })

    console.log(newResult.count)
    navigators.value[6].notification = newResult.count
    } catch(e) {
      toast.error(getErrorMessage(e))
    }
  }

  if (hasPermission(PERMISSIONS.ORGANIZATION)) {
    fetchCompanyByStructureId()
  }

  if(hasPermission(PERMISSIONS.PAYMENT_TRANSACTION)) {
    fetchPaymentTransactions()
  }

  const navigators = ref<Navigator[]>([
    {
      title: t('contract.organization'),
      icon: 'mdi-briefcase-outline',
      to: '/company/organization',
      isGroup: false,
      children: [],
      notification: 0,
      isPermitted: hasPermission(PERMISSIONS.ORGANIZATION)
    },
    {
      title: t('ourOrganization'),
      icon: 'mdi-briefcase-outline',
      to: '/company/our-organization',
      isGroup: false,
      children: [],
      isPermitted: hasPermission(PERMISSIONS.OUR_ORGANIZATION)
    },
    {
      title: t('contract.contracts'),
      icon: 'mdi-file-document-edit-outline',
      to: '/contract',
      exact: false,
      isGroup: true,
      isPermitted: hasPermission(PERMISSIONS.CONTRACTS),
      children: [
        {
          title: `${t('contract.contracts')}  `,
          icon: null,
          exact: true,
          to: '/contract/contracts',
          isPermitted: hasPermission(PERMISSIONS.CONTRACTS)
        },
        {
          title: t('templates'),
          icon: null,
          to: '/contract/templates',
          exact: true,
          isPermitted: hasPermission(PERMISSIONS.CONTRACTS_TEMPLETE)
        },
        {
          title: `${t('contractsBetweenSubscribers')}`,
          icon: null,
          exact: true,
          to: '/contract/fond/contract-others',
          isPermitted: hasPermission(PERMISSIONS.CONTRACTS_FOND)
        }
      ]
    },
    {
      title: t('cash.event'),
      icon: 'mdi-microphone',
      to: '/events',
      exact: false,
      isGroup: true,
      isPermitted: hasPermission(PERMISSIONS.EVENTS),
      children: [
        {
          title: t('tickets.eventList'),
          icon: null,
          to: '/events/event',
          isPermitted: hasPermission(PERMISSIONS.EVENTS_ALL)
        },
        {
          title: t('tickets.soldTickets'),
          icon: null,
          to: '/super-user/sold-tickets',
          isPermitted: store.isSuperUser
        },
        {
          title: t('tickets.returnedTickets'),
          icon: null,
          to: '/super-user/returned-tickets',
          isPermitted: store.isSuperUser
        },
        {
          title: t('tickets.applicationsForParticipationInEvents'),
          icon: null,
          to: '/events/application',
          isPermitted: hasPermission(PERMISSIONS.EVENTS_REQUEST_ATTEND)
        },
        {
          title: t('events.view_event'),
          icon: null,
          to: '/events/view/list',
          isPermitted: hasPermission(PERMISSIONS.EVENTS_FOND)
        },
        {
          title: t('events.my_events'),
          isPermitted: hasPermission(PERMISSIONS.EVENTS_MY_AGENT),
          icon: null,
          to: '/events/my-event'
        },
        {
          title: t('events.all'),
          isPermitted: hasPermission(PERMISSIONS.EVENTS_ALL_AGENT),
          icon: null,
          to: '/events/all-event'
        }
      ]
    },
    {
      title: t('halls.title'),
      icon: 'mdi-office-building-marker',
      to: '/palaces',
      isGroup: false,
      children: [],
      isPermitted: hasPermission(PERMISSIONS.PALACES)
    },
    {
      title: t('report.report'),
      icon: 'mdi-clipboard-check-multiple-outline',
      to: '/reports',
      exact: false,
      isGroup: true,
      isPermitted: hasPermission(PERMISSIONS.REPORTS),
      children: [
        {
          title: t('report.statisticsTickets'),
          icon: null,
          to: '/reports/statistics-by-tickets',
          isPermitted: hasPermission(PERMISSIONS.CHRONOLGY_VALIDATION)
        },

        {
          title: t('report.reportTicket'),
          icon: null,
          to: '/reports/report-by-ticket',
          isPermitted: hasPermission(PERMISSIONS.REPORTS_TICKETS)
        },
        {
          title: t('report.returnedTickets'),
          icon: null,
          to: '/reports/report-by-returned-tickets',
          isPermitted: hasPermission(PERMISSIONS.REPORTS_TICKETS)
        },
        {
          title: t('reports.reportByCalendar'),
          icon: null,
          to: '/reports/report-by-calendar',
          isPermitted: hasPermission(PERMISSIONS.REPORTS_FOND)
        },
        {
          title: t('reports.reportByEvent'),
          icon: null,
          to: '/reports/report-by-event',
          isPermitted: hasPermission(PERMISSIONS.REPORTS_FOND)
        },
        {
          title: t('reports.reportBySales'),
          icon: null,
          to: '/reports/reports-by-sales',
          isPermitted: hasPermission(PERMISSIONS.REPORTS_FOND)
        },
        {
          title: t('reports.reportByMonth'),
          icon: null,
          to: '/reports/reports-by-month',
          isPermitted:
            (store.isTheatre || store.isFond || store.isOrganizer) &&
            (
              hasPermission(PERMISSIONS.REPORTS) ||
              hasPermission(PERMISSIONS.ORGANIZATION)
            )
        },
        {
          title: t('reports.tariffReport'),
          icon: null,
          to: '/reports/reports-by-tarif',
          isPermitted: hasPermission(PERMISSIONS.REPORTS_MUSEIUM)
        },
        {
          title: t('reports.benefitsReports'),
          icon: null,
          to: '/reports/reports-by-benefits',
          isPermitted: hasPermission(PERMISSIONS.REPORTS_MUSEIUM)
        },
        {
          title: t('reports.reportByRegion'),
          icon: null,
          to: '/reports/reports-by-region',
          isPermitted: hasPermission(PERMISSIONS.REPORTS_MUSEIUM)
        },
        {
          title: t('reports.reportByCountry'),
          icon: null,
          to: '/reports/reports-by-country',
          isPermitted: hasPermission(PERMISSIONS.REPORTS_MUSEIUM)
        }
      ]
    },
    {
      title: t('paymenttransactions'),
      icon: 'mdi-clipboard-check-multiple-outline',
      to: '/payment-transactions',
      exact: false,
      isGroup: false,
      isPermitted: hasPermission(PERMISSIONS.PAYMENT_TRANSACTION),
      notification: 0
    },
    {
      title: t('reports.dynamic'),
      icon: 'mdi-clipboard-check-multiple-outline',
      to: '/reports/dynamic',
      exact: false,
      isGroup: false,
      isPermitted: hasPermission(PERMISSIONS.REPORTS_FOND)
    },
    {
      title: t('reports.forMuseums'),
      icon: 'mdi-clipboard-check-multiple-outline',
      to: '/reports/fond',
      exact: false,
      isGroup: true,
      isPermitted: hasPermission(PERMISSIONS.REPORTS_FOND),
      children: [
        {
          title: t('reports.tariffReport'),
          icon: null,
          to: '/reports/fond/reports-by-tarif',
          isPermitted: hasPermission(PERMISSIONS.REPORTS_FOND)
        },
        {
          title: t('reports.benefitsReports'),
          icon: null,
          to: '/reports/fond/reports-by-benefits',
          isPermitted: hasPermission(PERMISSIONS.REPORTS_FOND)
        },
        {
          title: t('reports.reportByRegion'),
          icon: null,
          to: '/reports/fond/reports-by-region',
          isPermitted: hasPermission(PERMISSIONS.REPORTS_FOND)
        },
        {
          title: t('reports.reportByCountry'),
          icon: null,
          to: '/reports/fond/reports-by-country',
          isPermitted: hasPermission(PERMISSIONS.REPORTS_FOND)
        }
      ]
    },
    {
      title: t('admin.administration'),
      icon: 'mdi-cog-outline',
      to: '/admin',
      exact: false,
      isGroup: true,
      isPermitted: hasPermission(PERMISSIONS.ADMINISTRATOR),
      children: [
        {
          title: t('user.users'),
          icon: null,
          to: '/admin/users',
          isPermitted: hasPermission(PERMISSIONS.USERS)
        },
        {
          title: t('user.userTurniket'),
          icon: null,
          to: '/admin/turniket-user',
          isPermitted: hasPermission(PERMISSIONS.TURNIKET_ACCAUNT)
        },
        {
          title: t('organizationUsers'),
          icon: null,
          to: '/admin/users-organizations',
          isPermitted: hasPermission(PERMISSIONS.ORGANIZATION)
        }
      ]
    },
    {
      title: t('cash.boxOffice'),
      icon: 'mdi-cash-multiple',
      to: '/cash',
      exact: false,
      isGroup: true,
      isPermitted: hasPermission(PERMISSIONS.CASH),
      children: [
        {
          title: t('tickets.ticketSelling'),
          icon: 'mdi-cash',
          to: store.isMuseum ? '/cash/museum-cashbox' : '/cash/cashbox',
          isPermitted: hasPermission(PERMISSIONS.CASH_SOLD_TICKETS)
        },
        {
          title: t('tickets.soldTickets'),
          icon: 'mdi-credit-card-outline',
          to: '/cash/sold-tickets',
          isPermitted: hasPermission(PERMISSIONS.CASH_MONITORING)
        },
        {
          title: t('tickets.returnedTickets'),
          icon: 'mdi-refresh',
          to: '/cash/rejected-tickets',
          isPermitted: hasPermission(PERMISSIONS.CASH_RETURN_TICKETS)
        },
        {
          title: t('tickets.bookedTickets'),
          icon: 'mdi-calendar-check-outline',
          to: '/cash/booked-tickets',
          isPermitted: store.isTheatre && hasPermission(PERMISSIONS.CASH_RETURN_TICKETS) && cashierStore.isBookingStatus
        },
        {
          title: `${t('tickets.reports')} `,
          icon: 'mdi-chart-bar',
          to: '/cash/reports',
          exact: false,
          isGroup: true,
          isPermitted: store.isMuseum && hasPermission(PERMISSIONS.CASH),
          subChildren: [
            {
              title: `${t('reports.tariffReport')} `,
              icon: null,
              to: '/cash/reports/tariff',
              isPermitted: hasPermission(PERMISSIONS.CASH)
            },
            {
              title: `${t('reports.benefitsReports')} `,
              icon: null,
              to: '/cash/reports/benefits',
              isPermitted: hasPermission(PERMISSIONS.CASH)
            },
            {
              title: `${t('reports.reportByRegion')} `,
              icon: null,
              to: '/cash/reports/by-region',
              isPermitted: hasPermission(PERMISSIONS.CASH)
            },
            {
              title: `${t('reports.reportByCountry')} `,
              icon: null,
              to: '/cash/reports/by-country',
              isPermitted: hasPermission(PERMISSIONS.CASH)
            }
          ]
        }
      ]
    },
    {
      title: t('directory.directories'),
      icon: 'mdi-bookmark-outline',
      to: '/directory',
      exact: false,
      isGroup: true,
      isPermitted: hasPermission(PERMISSIONS.DICTIONARIES),
      children: [
        {
          title: t('directory.ageLimit'),
          icon: null,
          to: '/directory/age-limit',
          isPermitted: hasPermission(PERMISSIONS.DICTIONARIES)
        },
        {
          title: t('directory.systemSetup'),
          icon: null,
          to: '/directory/system-setup',
          isPermitted: hasPermission(PERMISSIONS.DICTIONARIES)
        },
        {
          title: t('directory.region'),
          icon: null,
          to: '/directory/region',
          isPermitted: hasPermission(PERMISSIONS.DICTIONARIES)
        },
        {
          title: t('directory.district'),
          icon: null,
          to: '/directory/district',
          isPermitted: hasPermission(PERMISSIONS.DICTIONARIES)
        },
        {
          title: t('directory.mxik'),
          icon: null,
          to: '/directory/mxik',
          isPermitted: hasPermission(PERMISSIONS.DICTIONARIES)
        }
      ]
    },
    {
      title: t('blockchian'),
      icon: 'mdi-bitcoin',
      to: '/blockchain',
      exact: false,
      isGroup: true,
      isPermitted: hasPermission(PERMISSIONS.BLOCKCHAIN),
      children: [
        {
          title: t('ticketsName'),
          icon: null,
          to: '/blockchain/tickets',
          isPermitted: hasPermission(PERMISSIONS.BLOCKCHAIN)
        }
      ]
    }
  ])

  const createUserReports = () => {
    const reportsNavIndex = navigators.value.findIndex((nav: Navigator) => nav.title === t('report.report'))
    if (userReports.value.length === 0) return

    navigators.value.splice((reportsNavIndex === -1 ? 0 : reportsNavIndex) + 1, 0, {
      title: t('report.orgReports'),
      icon: 'mdi-chart-bar',
      to: '/reports/organization-reports/:id',
      exact: false,
      isGroup: true,
      isPermitted: hasPermission(PERMISSIONS.REPORTS),
      children: userReports.value.map((report: DynamicModel) => ({
        title: locale.value === 'ru' ? report.nameRu : locale.value === 'uz' ? report.nameUz : report.nameEn,
        icon: null,
        to: `/reports/organization-reports/${report.id}`,
        isPermitted: hasPermission(PERMISSIONS.REPORTS)
      }))
    })
  }

  fetchUserReports()

  watch(
    () => cashierStore.isReportsLoad,
    () => {
      if (cashierStore.isReportsLoad) {
        fetchUserReports()
        if (hasPermission(PERMISSIONS.ORGANIZATION)) {
          fetchCompanyByStructureId()
        }
        cashierStore.isReportsLoad = false
      }
    }
  )

  return {
    navigators
  }
}
