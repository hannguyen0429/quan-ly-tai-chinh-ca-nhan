import { useEffect, useMemo, useState } from 'react'
import { locations } from '../data/locations'
import {
  emptyProfile,
  isProfileComplete,
  type Dependent,
  type Gender,
  type HouseholdProfile,
} from '../lib/household'
import { estimateLiving } from '../lib/livingEstimate'
import { formatVnd } from '../lib/money'

const STORAGE_KEY = 'tlch-v2-household-profile'

function newDependent(): Dependent {
  return {
    id: crypto.randomUUID(),
    name: '',
    age: '',
  }
}

function loadProfile(): HouseholdProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyProfile
    const parsed = JSON.parse(raw) as HouseholdProfile
    return {
      ...emptyProfile,
      ...parsed,
      dependents: Array.isArray(parsed.dependents) ? parsed.dependents : [],
    }
  } catch {
    return emptyProfile
  }
}

export function Info() {
  const [profile, setProfile] = useState<HouseholdProfile>(loadProfile)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  }, [profile])

  const complete = isProfileComplete(profile)
  const estimate = useMemo(
    () => (complete ? estimateLiving(profile) : null),
    [complete, profile],
  )

  function update<K extends keyof HouseholdProfile>(
    key: K,
    value: HouseholdProfile[K],
  ) {
    setProfile((current) => ({ ...current, [key]: value }))
  }

  function updateDependent(id: string, patch: Partial<Dependent>) {
    setProfile((current) => ({
      ...current,
      dependents: current.dependents.map((person) =>
        person.id === id ? { ...person, ...patch } : person,
      ),
    }))
  }

  return (
    <div className="screen">
      <header className="topbar">
        <p className="eyebrow">Thông tin</p>
        <h1>Hồ sơ hộ gia đình</h1>
        <p className="lede">
          Điền đủ họ tên, giới tính, tuổi và nơi sống. Người phụ thuộc có thể
          thêm hoặc xoá. Dự toán bên dưới chỉ là đề xuất, không ghi vào Chi phí.
        </p>
      </header>

      <section className="card">
        <div className="card-head">
          <h2>Thông tin cơ bản</h2>
        </div>
        <div className="form-grid">
          <label className="field">
            <span>Họ tên</span>
            <input
              type="text"
              autoComplete="name"
              value={profile.fullName}
              onChange={(event) => update('fullName', event.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </label>
          <label className="field">
            <span>Giới tính</span>
            <select
              value={profile.gender}
              onChange={(event) =>
                update('gender', event.target.value as Gender | '')
              }
            >
              <option value="">Chọn</option>
              <option value="nam">Nam</option>
              <option value="nu">Nữ</option>
              <option value="khac">Khác</option>
            </select>
          </label>
          <label className="field">
            <span>Tuổi</span>
            <input
              type="number"
              min={0}
              max={120}
              inputMode="numeric"
              value={profile.age}
              onChange={(event) => update('age', event.target.value)}
              placeholder="32"
            />
          </label>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Danh sách người phụ thuộc</h2>
        </div>
        <p className="footnote">
          Con, bố mẹ, người sống chung. Có thể để trống nếu bạn sống một mình.
        </p>
        {profile.dependents.length > 0 && (
          <ul className="dependent-list">
            {profile.dependents.map((person, index) => (
              <li key={person.id} className="dependent-row">
                <label className="field">
                  <span>Tên {index + 1}</span>
                  <input
                    type="text"
                    value={person.name}
                    onChange={(event) =>
                      updateDependent(person.id, { name: event.target.value })
                    }
                    placeholder="Tên"
                  />
                </label>
                <label className="field">
                  <span>Tuổi</span>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    inputMode="numeric"
                    value={person.age}
                    onChange={(event) =>
                      updateDependent(person.id, { age: event.target.value })
                    }
                    placeholder="8"
                  />
                </label>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() =>
                    setProfile((current) => ({
                      ...current,
                      dependents: current.dependents.filter(
                        (item) => item.id !== person.id,
                      ),
                    }))
                  }
                >
                  Xoá
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="secondary-btn"
          onClick={() =>
            setProfile((current) => ({
              ...current,
              dependents: [...current.dependents, newDependent()],
            }))
          }
        >
          Thêm người phụ thuộc
        </button>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Nơi sống</h2>
        </div>
        <label className="field">
          <span>Tỉnh / thành phố</span>
          <select
            value={profile.locationId}
            onChange={(event) => update('locationId', event.target.value)}
          >
            <option value="">Chọn nơi sống</option>
            {[...locations]
              .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
              .map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      {estimate ? (
        <section className="card estimate-card" aria-live="polite">
          <div className="card-head">
            <h2>Dự toán đề xuất / tháng</h2>
          </div>
          <p className="footnote">
            {estimate.people} người tại {estimate.locationName}. Ước lượng theo
            mặt bằng chi phí nơi sống — bạn dùng hoặc bỏ qua, app không đưa sang
            Chi phí.
          </p>
          <dl className="stat-row">
            <div>
              <dt>Sinh hoạt cả hộ</dt>
              <dd>{formatVnd(estimate.living)}</dd>
            </div>
            <div>
              <dt>Dự phòng ốm đau</dt>
              <dd>{formatVnd(estimate.medical)}</dd>
            </div>
          </dl>
        </section>
      ) : (
        <p className="muted">
          Điền đủ thông tin cơ bản, nơi sống, và tên tuổi từng người phụ thuộc
          (nếu có) để xem dự toán.
        </p>
      )}
    </div>
  )
}
