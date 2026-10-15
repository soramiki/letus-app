import { formatDate } from '../utils/date.js'
import { isSampleTask } from '../utils/sampleTasks.js'
import { SUMMARY_GROUPS, summarizeTasks } from '../utils/summary.js'
import { TaskList } from './TaskList.jsx'
import { Timeline } from './Timeline.jsx'

// 「ホーム」の画面：今日の要約 ＋ 科目ごとのタイムライン
export function HomeView({
  tasks,
  subjects,
  subjectColors,
  now,
  onToggleDone,
  onEdit,
  onAdd,
  onAddSamples,
  onRemoveSamples,
}) {
  if (tasks.length === 0) {
    return (
      <div className="empty">
        <p>
          まだ課題がありません。
          <br />
          まずは課題を1つ登録してみましょう。
        </p>
        <div className="empty__actions">
          <button type="button" className="button button--primary" onClick={onAdd}>
            ＋ 課題を追加
          </button>
          <button type="button" className="button" onClick={onAddSamples}>
            サンプルの課題で試す
          </button>
        </div>
      </div>
    )
  }

  const groups = summarizeTasks(tasks, now)
  const hasSamples = tasks.some(isSampleTask)
  const hasTodo = SUMMARY_GROUPS.some(({ key }) => groups[key].length > 0)

  // 要約の数字をタップしたら、その課題のまとまりまでスクロールする
  function scrollToGroup(key) {
    document.getElementById(`summary-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {hasSamples && (
        <div className="sample-banner">
          <span>架空のサンプルの課題を表示しています。</span>
          <button type="button" className="button" onClick={onRemoveSamples}>
            サンプルを消す
          </button>
        </div>
      )}

      <section className="home-section" aria-labelledby="today-heading">
        <h2 id="today-heading" className="home-section__heading">
          今日 {formatDate(now)}
        </h2>

        <div className="summary">
          {SUMMARY_GROUPS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`summary__card summary__card--${key}`}
              onClick={() => scrollToGroup(key)}
              disabled={groups[key].length === 0}
            >
              <span className="summary__count">{groups[key].length}</span>
              <span className="summary__label">{label}</span>
            </button>
          ))}
        </div>

        {hasTodo ? (
          SUMMARY_GROUPS.filter(({ key }) => groups[key].length > 0).map(({ key, label }) => (
            <div key={key} id={`summary-${key}`} className="summary-group">
              <h3 className={`summary-group__heading summary-group__heading--${key}`}>{label}</h3>
              <TaskList
                tasks={groups[key]}
                hasAnyTask
                now={now}
                onToggleDone={onToggleDone}
                onEdit={onEdit}
              />
            </div>
          ))
        ) : (
          <p className="summary-clear">今日やることはありません。</p>
        )}
      </section>

      <section className="home-section" aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="home-section__heading">
          タイムライン
        </h2>
        <Timeline
          tasks={tasks}
          subjects={subjects}
          subjectColors={subjectColors}
          now={now}
          onEdit={onEdit}
        />
      </section>
    </>
  )
}
