from playwright.sync_api import sync_playwright
from pathlib import Path
import re
root=Path(__file__).resolve().parent.parent
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for size in [(800,640),(1200,640),(1536,864)]:
  page=browser.new_page(viewport={'width':size[0],'height':size[1]})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  html=re.sub(r'<script defer src="[^"]+"></script>','',(root/'index.html').read_text());page.set_content(html)
  for f in ['styles.css','experience.css']:page.add_style_tag(content=(root/f).read_text())
  for f in ['three-view.js','app.js','experience.js']:page.add_script_tag(content=(root/f).read_text())
  page.locator('[data-ex-action=projects]').first.click();page.locator('.hub-card [data-ex-action=open]').first.click();page.locator('[data-ex-action=open-editor][data-ex-id="2d"]').click();page.locator('[data-action=view-mode][data-id="stack"]').click()
  stack=page.locator('.overview-wrap');initial=stack.evaluate('(e)=>e.scrollTop');page.locator('[data-action=stack-scroll][data-id="next"]').click();page.wait_for_timeout(400)
  scrolled=stack.evaluate('(e)=>e.scrollTop');assert scrolled>initial,(size,initial,scrolled)
  stack.hover();page.mouse.wheel(0,300);page.wait_for_timeout(250);assert stack.evaluate('(e)=>e.scrollTop')>=scrolled
  # Main route preview from stack must take the user into 2D.
  page.locator('#previewBtn').click();assert page.locator('#floorSvg').count()==1,'Preview opened without a plan'
  page.locator('[data-action=pick-route][data-id="to"]').click();assert page.locator('.route-pick-notice').count()==1
  room=page.locator('#floorSvg g[data-type="room"]').first
  roomid=room.get_attribute('data-id')
  # Emit pointer event on room's rect; exact route should be picked.
  room.locator('rect.room').click(force=True)
  assert page.locator('#routeTo').input_value()=='room:'+roomid,(size,page.locator('#routeTo').input_value(),roomid)
  assert page.locator('.route-pick-notice').count()==0
  assert not errors,(size,errors)
  print('PASS',size,'scroll controls / mousewheel / stack→preview 2D / room pick')
  page.close()
 browser.close()