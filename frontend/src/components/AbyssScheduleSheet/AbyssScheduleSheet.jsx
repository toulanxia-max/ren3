import React, { forwardRef, useMemo } from 'react';

const HEADER_BG = '#D9D9D9';
const ROW1_BG = '#FFFFFF';
const ROW2_BG = '#D9D9D9';
const CAPTAIN_BG = '#FFFF00';

const outer = {
  width: 880,
  backgroundColor: '#ffffff',
  padding: '36px 40px',
  boxSizing: 'border-box',
  fontFamily: '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif',
  color: '#000000',
};

const titleRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 20,
  marginBottom: 28,
};

const title = {
  fontSize: 30,
  fontWeight: 700,
  margin: 0,
  letterSpacing: 2,
};

const logoStyle = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  objectFit: 'cover',
  flexShrink: 0,
};

const teamBlock = { marginBottom: 28 };

const teamHeader = {
  backgroundColor: HEADER_BG,
  textAlign: 'center',
  fontWeight: 700,
  fontSize: 16,
  padding: '10px 12px',
  border: '1px solid #ffffff',
  boxSizing: 'border-box',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  tableLayout: 'fixed',
};

const tdBase = {
  border: '1px solid #ffffff',
  padding: '14px 12px',
  fontSize: 15,
  textAlign: 'left',
  width: '20%',
  verticalAlign: 'middle',
  wordBreak: 'break-all',
};

const captainSpan = {
  backgroundColor: CAPTAIN_BG,
  padding: '2px 8px',
  display: 'inline-block',
};

function displayNameForMember(m) {
  if (!m?.user) return '';
  const n = (m.user.display_name || m.user.username || '').trim();
  return n || '未知';
}

/** 队长首位 + 队员；凑满 10 格（5×2），不足为空字符串 */
export function buildSlotsForTeam(team) {
  const members = team?.members || [];
  const captain = members.find((x) => x.role === 'captain');
  const others = members.filter((x) => x.role !== 'captain').sort((a, b) => a.id - b.id);
  const slots = [];
  if (captain) {
    slots.push({ text: displayNameForMember(captain), captain: true });
  }
  others.forEach((m) => slots.push({ text: displayNameForMember(m), captain: false }));
  while (slots.length < 10) {
    slots.push({ text: '', captain: false });
  }
  return slots.slice(0, 10);
}

/**
 * 与参考图一致：第一张 1～4 队，第二张 5～9 队。
 * 若无 team_number，则按顺序前 4 / 再接 5 队切分。
 */
export function splitTeamsForSheets(teams) {
  const sorted = [...(teams || [])].sort((a, b) => (a.team_number ?? a.id) - (b.team_number ?? b.id));
  const hasNum = sorted.some((t) => t.team_number != null && t.team_number !== '');
  if (hasNum) {
    const a = sorted.filter((t) => {
      const n = Number(t.team_number);
      return n >= 1 && n <= 4;
    });
    const b = sorted.filter((t) => {
      const n = Number(t.team_number);
      return n >= 5 && n <= 9;
    });
    return [a, b];
  }
  return [sorted.slice(0, 4), sorted.slice(4, 9)];
}

function TeamGrid({ team }) {
  const slots = useMemo(() => buildSlotsForTeam(team), [team]);
  const rowA = slots.slice(0, 5);
  const rowB = slots.slice(5, 10);

  return (
    <div style={teamBlock}>
      <div style={teamHeader}>{team.team_name}</div>
      <table style={tableStyle}>
        <tbody>
          <tr>
            {rowA.map((s, i) => (
              <td key={i} style={{ ...tdBase, backgroundColor: ROW1_BG }}>
                {s.captain && s.text ? <span style={captainSpan}>{s.text}</span> : s.text || '\u00a0'}
              </td>
            ))}
          </tr>
          <tr>
            {rowB.map((s, i) => (
              <td key={i} style={{ ...tdBase, backgroundColor: ROW2_BG }}>
                {s.captain && s.text ? <span style={captainSpan}>{s.text}</span> : s.text || '\u00a0'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const AbyssScheduleSheet = forwardRef(function AbyssScheduleSheet({ teams, logoSrc }, ref) {
  return (
    <div ref={ref} style={outer}>
      <div style={titleRow}>
        <img src={logoSrc || '/clan-logo.png'} alt="" style={logoStyle} crossOrigin="anonymous" />
        <h1 style={title}>紫川深渊排表</h1>
      </div>
      {(teams || []).map((team) => (
        <TeamGrid key={team.id} team={team} />
      ))}
    </div>
  );
});

export default AbyssScheduleSheet;
