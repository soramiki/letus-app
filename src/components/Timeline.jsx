import {
  addDays,
  daysBetween,
  diffDays,
  formatDateTime,
  getWeekday,
  isSameDay,
  startOfDay,
} from '../utils/date.js'
import { getShortLabel } from '../utils/shortLabel.js'

const DAY_WIDTH = 44 // 1日分の横幅（px）
const DAYS_BEFORE_TODAY = 2 // 今日より前を何日分見せるか
const MIN_DAYS = 21 // 最低でも3週間分は見せる（PCの広い画面がうまるくらい）
const MAX_DAYS = 60 // 長くなりすぎないように、最大60日分まで
const BADGE_SIZE = 22 // 締切の丸の大きさ（px）
const GAP = 2 // 同じ段に並べるとき、印どうしの最低のすき間（px）

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// 印を、重ならないように段に分ける
// 左から順に、入る段（前の印の右端より右から始まる段）のうち一番上に入れる。どこにも入らなければ段を増やす
function packIntoLanes(items) {
  const lanes = [] // 各段の、今の右端の位置
  const result = []
  for (const item of [...items].sort((a, b) => a.left - b.left)) {
    let lane = lanes.findIndex((right) => right + GAP <= item.left)
    if (lane === -1) {
      lane = lanes.length
      lanes.push(0)
      result.push([])
    }
    lanes[lane] = item.right
    result[lane].push(item)
  }
  return result
}

// 科目ごとのタイムライン
// 縦：科目（1科目1段。期間が重なるときだけ段を増やす） / 横：日付
// 丸：締切（中の数字は「第〇回」などの番号） / 帯：開始〜締切
// 日付の行と科目の列は、スクロールしても見えたままにする
export function Timeline({ tasks, subjects, subjectColors, now, onEdit }) {
  // 表示する期間：2日前から、いちばん遅い締切の次の日まで
  const rangeStart = addDays(startOfDay(now), -DAYS_BEFORE_TODAY)

  // 締切のある未完了の課題だけを出す
  // 表示期間より前に締切が過ぎたものは、左端に積み重なって見づらくなるので出さない（数だけ知らせる）
  const undone = tasks.filter((task) => !task.done && !task.missed && task.dueAt)
  const targets = undone.filter((task) => new Date(task.dueAt) >= rangeStart)
  const hiddenOverdueCount = undone.length - targets.length

  const hiddenNote = hiddenOverdueCount > 0 && (
    <p className="timeline-note">
      このほか、期限切れの課題が{hiddenOverdueCount}件あります（ホームで確認できます）。
    </p>
  )

  if (targets.length === 0) {
    return (
      <>
        {hiddenNote}
        <p className="timeline-empty">この先、締切のある未完了の課題はありません。</p>
      </>
    )
  }

  const lastDue = targets.reduce((max, task) => {
    const due = new Date(task.dueAt)
    return due > max ? due : max
  }, now)
  const dayCount = clamp(diffDays(rangeStart, lastDue) + 2, MIN_DAYS, MAX_DAYS)
  const days = Array.from({ length: dayCount }, (_, i) => addDays(rangeStart, i))

  // 日時 → 左からの位置（px）。期間の外は端にそろえる
  const toX = (date) => clamp(daysBetween(rangeStart, date), 0, dayCount) * DAY_WIDTH

  // 科目ごとに、課題を印にして段に分ける（科目の並びは一覧の科目順と同じ）
  const groups = subjects
    .map((subject) => {
      const items = targets
        .filter((task) => task.subject === subject)
        .map((task) => {
          const dueX = toX(new Date(task.dueAt))
          const startX = task.startAt ? toX(new Date(task.startAt)) : null
          return {
            task,
            dueX,
            startX,
            // この印が占める横の範囲（帯があれば帯の左端から、丸の右端まで）
            left: Math.min(startX ?? dueX, dueX) - BADGE_SIZE / 2,
            right: dueX + BADGE_SIZE / 2,
          }
        })
      return { subject, lanes: packIntoLanes(items) }
    })
    .filter((group) => group.lanes.length > 0)

  return (
    <>
      {hiddenNote}
      <div className="timeline">
        <div
          className="timeline__inner"
          style={{ '--tl-track-width': `${dayCount * DAY_WIDTH}px` }}
        >
          {/* 背景：日付ごとの縦の区切り（土日は色を付ける）と、今の線 */}
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

          {/* 見出し：日付（縦にスクロールしても上に残る） */}
          <div className="tl-row tl-row--header">
            <div className="tl-label">科目</div>
            <div className="tl-track">
              {days.map((day, i) => (
                <div
                  key={i}
                  className={`tl-date ${isSameDay(day, now) ? 'tl-date--today' : ''}`}
                  style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}
                >
                  <span className="tl-date__day">
                    {/* 期間の最初の日と、月の1日だけ「月/日」にする */}
                    {i === 0 || day.getDate() === 1
                      ? `${day.getMonth() + 1}/${day.getDate()}`
                      : day.getDate()}
                  </span>
                  <span className="tl-date__weekday">{getWeekday(day)}</span>
                </div>
              ))}
            </div>
          </div>

          {groups.map((group) =>
            group.lanes.map((lane, laneIndex) => (
              <div
                key={`${group.subject}-${laneIndex}`}
                className={`tl-row ${laneIndex === 0 ? 'tl-row--first' : ''}`}
              >
                {/* 科目名は、その科目の1段目にだけ出す */}
                <div className="tl-label">
                  {laneIndex === 0 && (
                    <>
                      <span
                        className="tl-dot"
                        style={{ background: subjectColors[group.subject] }}
                      />
                      <span className="tl-label__text">{group.subject}</span>
                    </>
                  )}
                </div>
                <div className="tl-track">
                  {lane.map((item) => (
                    <TimelineItem
                      key={item.task.id}
                      item={item}
                      color={subjectColors[group.subject]}
                      isOverdue={new Date(item.task.dueAt) < now}
                      onEdit={onEdit}
                    />
                  ))}
                </div>
              </div>
            )),
          )}
        </div>
      </div>
    </>
  )
}

// 課題1件分の印：開始日があれば開始〜締切の帯、締切に番号入りの丸
function TimelineItem({ item, color, isOverdue, onEdit }) {
  const { task, dueX, startX } = item
  const label = `${task.title}（締切 ${formatDateTime(task.dueAt)}）`

  return (
    <div className={`tl-item ${isOverdue ? 'tl-item--overdue' : ''}`}>
      {startX !== null && dueX > startX && (
        <div className="tl-bar" style={{ left: startX, width: dueX - startX, background: color }} />
      )}
      <button
        type="button"
        className="tl-badge"
        style={{ left: dueX, background: color }}
        onClick={() => onEdit(task)}
        aria-label={label}
        title={label}
      >
        {getShortLabel(task.title)}
      </button>
    </div>
  )
}
