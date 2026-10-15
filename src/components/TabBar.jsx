// 画面の切り替えに使うタブ（画面の一番下に固定）
const VIEWS = [
  { value: 'home', label: 'ホーム', icon: '⌂' },
  { value: 'list', label: '一覧', icon: '☰' },
]

export function TabBar({ view, onChange }) {
  return (
    <nav className="tab-bar" aria-label="画面の切り替え">
      {VIEWS.map((item) => (
        <button
          key={item.value}
          type="button"
          className="tab-bar__button"
          aria-current={view === item.value ? 'page' : undefined}
          onClick={() => onChange(item.value)}
        >
          <span className="tab-bar__icon" aria-hidden="true">
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </nav>
  )
}
