from pathlib import Path
for i in range(1,36):
 tier='legend' if i in (12,27,30,35) else 'gold' if i in (10,11,19,24,26,34) else 'silver' if i>=7 else 'bronze'
 colors={'bronze':('#fff0cf','#bb7937'),'silver':('#e8f2ff','#6886b2'),'gold':('#fff0a8','#b87611'),'legend':('#263358','#fff0b7')}
 bg,fg=colors[tier]; idx=f'{i:02d}'
 text=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><title>Fusión 2048, premio {i}</title><rect x="3" y="3" width="122" height="122" rx="30" fill="{bg}"/><circle cx="64" cy="64" r="52" fill="none" stroke="{fg}" stroke-width="4" stroke-dasharray="{4+i%6} 5"/><path d="M64 13l10 22 24-3-5 24 19 16-23 11-4 25-21-12-21 12-4-25-23-11 19-16-5-24 24 3z" fill="{fg}" opacity=".25"/><rect x="34" y="37" width="60" height="58" rx="14" fill="{fg}"/><text x="64" y="76" text-anchor="middle" fill="{bg}" font-family="system-ui" font-weight="900" font-size="32">{idx}</text></svg>'
 Path(f'games/fusion-2048/assets/achievements/fusion-2048-{idx}.svg').write_text(text,encoding='utf-8')
