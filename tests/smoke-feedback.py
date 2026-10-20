from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1400,'height':820})
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 from pathlib import Path
 import re
 root=Path(__file__).resolve().parent.parent
 html=(root/'index.html').read_text()
 html=re.sub(r'<script defer src="[^"]+"></script>','',html)
 page.set_content(html)
 page.add_style_tag(content=(root/'styles.css').read_text())
 page.add_style_tag(content=(root/'experience.css').read_text())
 for f in ['three-view.js','app.js','experience.js']:
  page.add_script_tag(content=(root/f).read_text())
 print('splash',page.locator('.launch-screen').count(),page.locator('.recent-item').count(),'errors',errors)
 page.locator('[data-ex-action=projects]').first.click()
 print('projects',page.locator('.hub-card').count())
 page.locator('.hub-card [data-ex-action=open]').first.click()
 print('site',page.locator('.site-layout').count())
 page.locator('[data-ex-action=open-editor][data-ex-id="2d"]').click()
 print('editor2d',page.locator('#floorSvg').count())
 page.locator('[data-action=view-mode][data-id=stack]').click()
 el=page.locator('.overview-wrap');print('stack',el.count(),el.evaluate('(e)=>({scroll:e.scrollHeight,client:e.clientHeight,overflow:getComputedStyle(e).overflowY})'))
 el.hover();page.mouse.wheel(0,600);page.wait_for_timeout(500);print('scrolled',el.evaluate('(e)=>e.scrollTop'))
 page.locator('[data-action=view-mode][data-id="3d"]').click()
 print('3d',page.locator('#building3d').count(),page.locator('.canvas-overlay').inner_text())
 page.locator('[data-ex-action=preview-route]').click()
 print('preview',page.locator('.route-endpoint-row').count(),page.locator('.route-result').count(),page.locator('#floorSvg').count())
 page.locator('[data-action=pick-route][data-id="to"]').click()
 print('pick',page.locator('.route-pick-notice').count())
 page.locator('#floorSvg g[data-type="room"]').first.click(force=True)
 print('clicked room',page.locator('#routeTo').input_value(),page.locator('.route-pick-notice').count())
 page.locator('[data-action=route]').last.click()
 print('route result',page.locator('.route-result').count(),'errors',errors)
 browser.close()