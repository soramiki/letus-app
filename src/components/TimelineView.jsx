import { Timeline } from './Timeline.jsx'

// 「タイムライン」の画面：先の予定を見渡して、重なりに気づく
export function TimelineView({ tasks, subjects, subjectColors, now, onEdit }) {
  return (
    <section aria-labelledby="timeline-heading">
      <h2 id="timeline-heading" className="page-heading">
        タイムライン
      </h2>
      <p className="page-note">
        丸＝締切（数字は「第〇回」などの番号）、帯＝開始〜締切、赤い線＝今。丸をタップで課題名を確認。
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
