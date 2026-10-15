import { Timeline } from './Timeline.jsx'

// 「タイムライン」の画面：先の予定を見渡して、重なりに気づく
export function TimelineView({ tasks, subjects, subjectColors, now, onEdit }) {
  return (
    <section aria-labelledby="timeline-heading">
      <h2 id="timeline-heading" className="page-heading">
        タイムライン
      </h2>
      <p className="page-note">
        帯は開始〜締切、◆は締切（開始日なし）。赤い線が今です。タップすると編集できます。
      </p>
      <Timeline
        tasks={tasks}
        subjects={subjects}
        subjectColors={subjectColors}
        now={now}
        onEdit={onEdit}
      />
    </section>
  )
}
