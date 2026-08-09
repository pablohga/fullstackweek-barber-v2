import { isPast, isToday, set } from "date-fns"

interface GetAvailableTimesProps {
  selectedDay: Date
  workingHours: any[]
  scheduleBlocks: any[]
  bookings: any[]
}

export const getAvailableTimes = ({
  selectedDay,
  workingHours,
  scheduleBlocks,
  bookings,
}: GetAvailableTimesProps) => {
  const weekday = selectedDay.getDay()
  const wh = workingHours.find((w) => w.weekday === weekday)

  if (!wh || !wh.isOpen) {
    return []
  }

  // Check if entire day is blocked
  const dayBlocks = scheduleBlocks.filter((b) => {
    const blockDate = new Date(b.date)
    return (
      blockDate.getFullYear() === selectedDay.getFullYear() &&
      blockDate.getMonth() === selectedDay.getMonth() &&
      blockDate.getDate() === selectedDay.getDate()
    )
  })

  const hasFullDayBlock = dayBlocks.some((b) => !b.startTime || !b.endTime)
  if (hasFullDayBlock) {
    return []
  }

  // Generate slots between wh.startTime and wh.endTime
  const slots: string[] = []
  let [currHour, currMinute] = wh.startTime.split(":").map(Number)
  const [endHour, endMinute] = wh.endTime.split(":").map(Number)

  while (
    currHour < endHour ||
    (currHour === endHour && currMinute < endMinute)
  ) {
    const timeStr = `${String(currHour).padStart(2, "0")}:${String(
      currMinute,
    ).padStart(2, "0")}`
    slots.push(timeStr)

    currMinute += 30
    if (currMinute >= 60) {
      currHour += 1
      currMinute = 0
    }
  }

  return slots.filter((time) => {
    const hour = Number(time.split(":")[0])
    const minutes = Number(time.split(":")[1])

    // 1. Past time check on today
    const timeIsOnThePast = isPast(set(new Date(), { hours: hour, minutes }))
    if (timeIsOnThePast && isToday(selectedDay)) {
      return false
    }

    // 2. Break time check
    if (
      wh.breakStart &&
      wh.breakEnd &&
      time >= wh.breakStart &&
      time < wh.breakEnd
    ) {
      return false
    }

    // 3. Schedule blocks check
    const isBlocked = dayBlocks.some((b) => {
      if (b.startTime && b.endTime) {
        return time >= b.startTime && time < b.endTime
      }
      return false
    })
    if (isBlocked) {
      return false
    }

    // 4. Existing bookings check
    const hasBooking = bookings.some((booking) => {
      const bookingDate = new Date(booking.date)
      return (
        bookingDate.getHours() === hour &&
        bookingDate.getMinutes() === minutes &&
        booking.status === "CONFIRMED"
      )
    })
    if (hasBooking) {
      return false
    }

    return true
  })
}
