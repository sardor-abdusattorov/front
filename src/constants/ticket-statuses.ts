export class TicketStatus {
  public static NEW = 1
  public static BRON = { color: 'green', value: 2, name: 'tickets.bookedTickets' }
  public static SALE = { color: 'yellow', value: 3, name: 'tickets.soldTickets' }
  public static RETURN = 4
  public static REBRON = { color: 'green', value: 5, name: 'tickets.bookedTickets' }
  public static RESALE = { color: 'yellow', value: 6, name: 'tickets.soldTickets' }
  public static USED = { color: 'brown', value: 7, name: 'usedTickets' }
  public static FOND_REJECTED = { color: 'blue', value: 10, name: 'tickets.canceled_tickets' }
}
