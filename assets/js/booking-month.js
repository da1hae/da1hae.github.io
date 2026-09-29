(function () {
  "use strict";

  const koreaDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  function getBookingMonth(now = new Date()) {
    const parts = Object.fromEntries(
      koreaDate.formatToParts(now).map(({ type, value }) => [type, value])
    );
    const year = Number(parts.year);
    const month = Number(parts.month);
    const day = Number(parts.day);
    const lastDay = new Date(Date.UTC(year, month, 0));
    // Monday = 1. Work with calendar dates in UTC after extracting the KST date.
    const lastMonday = lastDay.getUTCDate() - (lastDay.getUTCDay() + 6) % 7;
    const advance = day >= lastMonday;
    return {
      year: year + (advance && month === 12 ? 1 : 0),
      month: advance ? month % 12 + 1 : month,
      lastMonday,
      nextMidnight: Date.UTC(year, month - 1, day + 1) - 9 * 60 * 60 * 1000,
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { getBookingMonth };
  }
  if (typeof document === "undefined") return;

  const label = document.querySelector("[data-booking-month]");
  if (!label) return;
  let timer;
  function refresh() {
    clearTimeout(timer);
    const now = new Date();
    const booking = getBookingMonth(now);
    label.textContent = `${booking.month}월 `;
    timer = setTimeout(refresh, Math.max(100, booking.nextMidnight - now.getTime()));
  }
  refresh();
  // Refresh on return from device sleep or a background tab.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refresh();
  });
  window.addEventListener("pageshow", refresh);
})();
