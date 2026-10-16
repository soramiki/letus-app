// 読み込んだ予定を、今の課題の一覧に反映する（CLAUDE.md の「取り込みのルール」）
//
// 予定1件ごとに：
//   1. UID が登録済み → LETUS の項目（科目・開始・締切）だけ更新（締切の延長に対応）
//   2. 未登録で、同じ「科目名＋課題名」の課題がある → 空いている日付を埋め、UID を追加
//   3. どちらでもない → 新しい課題として追加（開始だけの予定は、締切未定の課題になる）
// ・完了チェックは書き換えない
// ・ただし markPastAsDone が true なら、新しく追加する課題のうち締切を過ぎたものは完了にする
//   （LETUS の書き出しには、もう提出したはずの過去の課題も入っているため）
//
// 元の tasks は変えずに、新しい一覧と、何が変わったかを返す
// （先に結果を見せて確認してもらうため、計算と反映を分けている）
export function importEvents(tasks, events, createId, { markPastAsDone = false, now = new Date() } = {}) {
  const next = tasks.map((task) => ({ ...task, letusUids: [...(task.letusUids ?? [])] }))
  const addedIds = new Set()
  const updatedIds = new Set()
  const touchedIds = new Set()

  for (const event of events) {
    // 開始の予定なら開始日時、それ以外は締切を扱う
    const field = event.kind === 'start' ? 'startAt' : 'dueAt'

    // 1. UID が登録済み
    let task = next.find((t) => t.letusUids.includes(event.uid))
    if (task) {
      touchedIds.add(task.id)
      if (task.subject !== event.subject || task[field] !== event.at) {
        task.subject = event.subject
        task[field] = event.at
        updatedIds.add(task.id)
      }
      continue
    }

    // 2. 同じ「科目名＋課題名」の課題がある
    task = next.find((t) => t.subject === event.subject && t.title === event.title)
    if (task) {
      touchedIds.add(task.id)
      if (!task[field]) task[field] = event.at
      task.letusUids.push(event.uid)
      updatedIds.add(task.id)
      continue
    }

    // 3. 新しい課題
    const newTask = {
      id: createId(),
      subject: event.subject,
      title: event.title,
      startAt: null,
      dueAt: null,
      done: false,
      letusUids: [event.uid],
    }
    newTask[field] = event.at
    next.push(newTask)
    addedIds.add(newTask.id)
    touchedIds.add(newTask.id)
  }

  // 新しく追加した課題のうち、締切を過ぎたもの（markPastAsDone なら完了にする）
  let pastCount = 0
  for (const task of next) {
    if (addedIds.has(task.id) && task.dueAt && new Date(task.dueAt) < now) {
      pastCount++
      if (markPastAsDone) task.done = true
    }
  }

  // 同じ取り込みの中で追加したものは「追加」だけに数える
  const updated = next.filter((t) => updatedIds.has(t.id) && !addedIds.has(t.id))
  const unchangedCount = [...touchedIds].filter(
    (id) => !addedIds.has(id) && !updatedIds.has(id),
  ).length

  return {
    tasks: next,
    added: next.filter((t) => addedIds.has(t.id)),
    pastCount,
    updated,
    unchangedCount,
  }
}
