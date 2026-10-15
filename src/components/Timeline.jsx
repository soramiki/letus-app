import { addDays, daysBetween, diffDays, formatDateTime, getWeekday, isSameDay, startOfDay } from '../utils/date.js'
import { sortTasks } from '../utils/sortTasks.js'

const DAY_WIDTH = 44 // 1日分の横幅（px）
const DAYS_BEFORE_TODAY = 2 // 今日より前を何日分見せるか
const MIN_DAYS = 14 // 最低でも2週間分は見せる
const MAX_DAYS = 60 // 長くなりすぎないように、最大60日分まで

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// 科目ごとのタイムライン
// 縦：科目ごとにまとめた課題 / 横：日付 / 帯：開始〜締切（開始がなければ締切に◆）
export function Timeline({ tasks, subjects, subjectColors, now, onEdit }) {
  // 締切のある未完了の課題だけを出す
  const targets = tasks.filter((task) => !task.done && task.dueAt)

  if (targets.length === 0) {
    return <p className="timeline-empty">締切のある未完了の課題はありません。</p>
  }

  // 表示する期間：2日前から、いちばん遅い締切の次の日まで
  const rangeStart = addDays(startOfDay(now), -DAYS_BEFORE_TODAY)
  const lastDue = targets.reduce((max, task) => {
    const due = new Date(task.dueAt)
    return due > max ? due : max
  }, now)
  const dayCount = clamp(diffDays(rangeStart, lastDue) + 2, MIN_DAYS, MAX_DAYS)
  const days = Array.from({ length: dayCount }, (_, i) => addDays(rangeStart, i))

  // 日時 → 左からの位置（px）。期間の外は端にそろえる
  const toX = (date) => clamp(daysBetween(rangeStart, date), 0, dayCount) * DAY_WIDTH

  // 科目ごとにまとめる（科目の並びは一覧の科目順と同じ）
  const groups = subjects
    .map((subject) => ({
      subject,
      tasks: sortTasks(targets.filter((task) => task.subject === subject)),
    }))
    .filter((group) => group.tasks.length > 0)

  return (
    <div className="timeline">
      <div className="timeline__inner" style={{ '--tl-track-width': `${dayCount * DAY_WIDTH}px` }}>
        {/* 背景：日付ごとの縦の区切り（土日は色を付ける）と、今日の線 */}
        <div className="tl-grid" aria-hidden="true">
          {days.map((day, i) => (
            <div
              key={i}
              className={`tl-grid__day ${day.getDay() === 0 || day.getDay() === 6 ? 'tl-grid__day--weekend' : ''}`}
              style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}
            />
          ))}
          <div className="tl-grid__now" style={{ left: toX(now) }} />
        </div>

        {/* 見出し：日付 */}
        <div className="tl-row tl-row--header">
          <div className="tl-label">科目・課題</div>
          <div className="tl-track">
            {days.map((day, i) => (
              <div
                key={i}
                className={`tl-date ${isSameDay(day, now) ? 'tl-date--today' : ''}`}
                style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}
              >
                <span className="tl-date__day">
                  {/* 期間の最初の日と、月の1日だけ「月/日」にする */}
                  {i === 0 || day.getDate() === 1 ? `${day.getMonth() + 1}/${day.getDate()}` : day.getDate()}
                </span>
                <span className="tl-date__weekday">{getWeekday(day)}</span>
              </div>
            ))}
          </div>
        </div>

        {groups.map((group) => (
          <div key={group.subject} className="tl-group">
            <div className="tl-row tl-row--subject">
              <div className="tl-label tl-label--subject">
                <span className="tl-dot" style={{ background: subjectColors[group.subject] }} />
                {group.subject}
              </div>
              <div className="tl-track" />
            </div>

            {group.tasks.map((task) => {
              const due = new Date(task.dueAt)
              const start = task.startAt ? new Date(task.startAt) : null
              const isOverdue = due < now
              const color = subjectColors[task.subject]
              const label = `${task.title}（締切 ${formatDateTime(task.dueAt)}）`

              return (
                <div key={task.id} className={`tl-row ${isOverdue ? 'tl-row--overdue' : ''}`}>
                  <button type="button" className="tl-label tl-label--task" onClick={() => onEdit(task)}>
                    {task.title}
                  </button>
                  <div className="tl-track">
                    {start ? (
                      // 開始〜締切の帯（短すぎて見えなくならないよう、最低8px）
                      <button
                        type="button"
                        className="tl-bar"
                        style={{
                          left: toX(start),
                          width: Math.max(toX(due) - toX(start), 8),
                          background: color,
                        }}
                        onClick={() => onEdit(task)}
                        aria-label={label}
                        title={label}
                      />
                    ) : (
                      // 開始日がない課題は、締切に◆の印
                      <button
                        type="button"
                        className="tl-marker"
                        style={{ left: toX(due), background: color }}
                        onClick={() => onEdit(task)}
                        aria-label={label}
                        title={label}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
