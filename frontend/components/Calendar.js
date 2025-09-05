import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';

const Calendar = ({ events, lists, selectedDate, onDateClick, onEventClick, onListClick }) => {
  const { language } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Check if there are events in the current month
  const hasEventsInCurrentMonth = () => {
    if (!Array.isArray(events) || events.length === 0) return false;
    
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    return events.some(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return (eventStart >= monthStart && eventStart <= monthEnd) ||
             (eventEnd >= monthStart && eventEnd <= monthEnd) ||
             (eventStart <= monthStart && eventEnd >= monthEnd);
    });
  };

  const getEventsForDate = (date) => {
    if (!Array.isArray(events)) {
      return [];
    }
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      // Use date-fns isSameDay for accurate date comparison
      const isStartMatch = isSameDay(eventStart, date);
      const isEndMatch = isSameDay(eventEnd, date);
      const isInRange = date > eventStart && date < eventEnd;
      
      // Debug logging for first few events
      if (events.length > 0 && events.indexOf(event) < 3) {
        console.log('Calendar date comparison:', {
          checkingDate: date.toDateString(),
          eventTitle: event.title,
          eventStart: eventStart.toDateString(),
          eventEnd: eventEnd.toDateString(),
          isStartMatch,
          isEndMatch,
          isInRange,
          willShow: isStartMatch || isEndMatch || isInRange
        });
      }
      
      return isStartMatch || isEndMatch || isInRange;
    });
  };

  const getListsForDate = (date) => {
    if (!Array.isArray(lists)) {
      return [];
    }
    return lists.filter(list => {
      const listDate = new Date(list.listDate);
      return isSameDay(listDate, date);
    });
  };

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const dayEvents = getEventsForDate(day);
      const dayLists = getListsForDate(day);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = isSameDay(day, new Date());
      const isSelected = isSameDay(day, selectedDate);

      // Create a clean date object using local timezone
      const year = day.getFullYear();
      const month = day.getMonth();
      const date = day.getDate();
      const cleanDate = new Date(year, month, date, 12, 0, 0, 0); // Use noon to avoid timezone edge cases

      days.push(
        <div
          key={day}
          className={`min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border-r border-b border-gray-200 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${
            !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
          } ${isToday ? 'bg-blue-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => {
            console.log('Calendar day clicked:', {
              originalDay: day.toISOString(),
              originalDayString: day.toDateString(),
              cleanDate: cleanDate.toISOString(),
              cleanDateString: cleanDate.toDateString(),
              year: cleanDate.getFullYear(),
              month: cleanDate.getMonth(),
              day: cleanDate.getDate()
            });
            onDateClick(cleanDate);
          }}
        >
          <div className={`text-xs sm:text-sm font-medium mb-1 ${
            isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
          }`}>
            {format(day, dateFormat)}
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            {/* Combine events and lists for display */}
            {[
              ...dayEvents.map(event => ({ ...event, type: 'event' })),
              ...dayLists.map(list => ({ ...list, type: 'list' }))
            ].slice(0, 3).map((item, index) => (
              <div
                key={item._id}
                className={`text-xs p-0.5 sm:p-1 rounded truncate cursor-pointer hover:opacity-80 ${
                  item.type === 'list' ? 'bg-green-100 text-green-800 border-l-2 border-green-500' : ''
                }`}
                style={item.type === 'event' ? { backgroundColor: item.color + '20', color: item.color } : {}}
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.type === 'event') {
                    onEventClick(item);
                  } else if (item.type === 'list') {
                    onListClick(item);
                  }
                }}
                title={item.type === 'list' ? `List: ${item.title} (${item.items?.length || 0} items)` : item.title}
              >
                {item.type === 'list' ? '📋 ' : ''}{item.title}
                {item.type === 'list' && item.items?.length > 0 && (
                  <span className="ml-1 text-xs opacity-75">({item.items.length})</span>
                )}
              </div>
            ))}
            {dayEvents.length + dayLists.length > 3 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length + dayLists.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={day} className="grid grid-cols-7">
        {days}
      </div>
    );
    days = [];
  }

  const weekDays = [
    getTranslation(language, 'sunday'),
    getTranslation(language, 'monday'),
    getTranslation(language, 'tuesday'),
    getTranslation(language, 'wednesday'),
    getTranslation(language, 'thursday'),
    getTranslation(language, 'friday'),
    getTranslation(language, 'saturday')
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            {getTranslation(language, format(currentMonth, 'MMMM').toLowerCase())} {format(currentMonth, 'yyyy')}
          </h2>
          {events.length > 0 && !hasEventsInCurrentMonth() && (
            <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hidden sm:inline">
              Events in other months
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={prevMonth}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-2 py-1 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            {getTranslation(language, 'today')}
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Desktop: Week Days Header */}
      <div className="hidden sm:grid grid-cols-7 bg-gray-50">
        {weekDays.map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Desktop: Calendar Grid */}
      <div className="hidden sm:block divide-y divide-gray-200">
        {rows}
      </div>

      {/* Mobile: Vertical Day List */}
      <div className="sm:hidden">
        {Array.from({ length: 35 }, (_, i) => {
          const day = addDays(startDate, i);
          const dayEvents = getEventsForDate(day);
          const dayLists = getListsForDate(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);

          // Create a clean date object for the click handler
          const year = day.getFullYear();
          const month = day.getMonth();
          const date = day.getDate();
          const cleanDate = new Date(year, month, date, 12, 0, 0, 0);

          // Only show days that are in the current month or have events/lists
          if (!isCurrentMonth && dayEvents.length === 0 && dayLists.length === 0) {
            return null;
          }

          return (
            <div
              key={day}
              className={`p-3 border-b border-gray-200 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${
                !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
              } ${isToday ? 'bg-blue-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => {
                onDateClick(cleanDate);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`text-lg font-semibold ${
                    isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="flex flex-col">
                    <div className={`text-sm font-medium ${
                      isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {getTranslation(language, format(day, 'EEEE').toLowerCase())}
                    </div>
                    <div className={`text-xs ${
                      isToday ? 'text-blue-500' : isCurrentMonth ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {getTranslation(language, format(day, 'MMMM').toLowerCase())} {format(day, 'yyyy')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {dayEvents.length + dayLists.length > 0 && (
                    <div className="text-xs text-gray-500">
                      {dayEvents.length + dayLists.length} {getTranslation(language, dayEvents.length + dayLists.length === 1 ? 'item' : 'items')}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Events and Lists */}
              {(dayEvents.length > 0 || dayLists.length > 0) && (
                <div className="mt-3 space-y-1">
                  {[
                    ...dayEvents.map(event => ({ ...event, type: 'event' })),
                    ...dayLists.map(list => ({ ...list, type: 'list' }))
                  ].map((item, index) => (
                    <div
                      key={item._id}
                      className={`text-sm p-2 rounded cursor-pointer hover:opacity-80 ${
                        item.type === 'list' ? 'bg-green-100 text-green-800 border-l-2 border-green-500' : ''
                      }`}
                      style={item.type === 'event' ? { backgroundColor: item.color + '20', color: item.color } : {}}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.type === 'event') {
                          onEventClick(item);
                        } else if (item.type === 'list') {
                          onListClick(item);
                        }
                      }}
                    >
                      {item.type === 'list' ? '📋 ' : ''}{item.title}
                      {item.type === 'list' && item.items?.length > 0 && (
                        <span className="ml-1 text-xs opacity-75">({item.items.length})</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Calendar;
