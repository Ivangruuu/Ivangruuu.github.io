"""Generate the one-page portfolio resume. Requires reportlab and Node.js."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor

ROOT = Path(__file__).resolve().parents[1]
for name in ('Regular', 'Bold'):
    pdfmetrics.registerFont(TTFont('Manrope' + name, str(ROOT / 'scripts/fonts' / f'Manrope-{name}.ttf')))
pdfmetrics.registerFontFamily('ManropeRegular', normal='ManropeRegular', bold='ManropeBold', italic='ManropeRegular', boldItalic='ManropeBold')
output = ROOT / 'dist/assets/ivan-gruzdev-resume.pdf'
c = canvas.Canvas(str(output), pagesize=(595.276, 841.89))
c.setTitle('Иван Груздев — ML Engineer')
c.setAuthor('Иван Груздев')
bg, panel, ink, muted, accent, line = map(HexColor, ['#10120f','#181c16','#f0f2eb','#b2baa9','#c4f568','#343b2e'])
c.setFillColor(bg); c.rect(0, 0, 596, 842, fill=1, stroke=0)

def text(x, y, value, size=9, color=ink, bold=False):
    c.setFont('ManropeBold' if bold else 'ManropeRegular', size)
    c.setFillColor(color); c.drawString(x, y, value)

def para(x, y, width, value, size=9, leading=13, color=ink):
    style=ParagraphStyle('body',fontName='ManropeRegular',fontSize=size,leading=leading,textColor=color)
    p=Paragraph(value,style); _, h=p.wrap(width, 1000);p.drawOn(c,x,y-h)
    return y-h

def label(x, y, value):
    text(x,y,value,7.2,accent,True)

def rule(y):
    c.setStrokeColor(line);c.setLineWidth(.5);c.line(36,y,559,y)

text(36,807,'IG.',17,bold=True);text(95,809,'ML ENGINEER / MOSCOW',7.5,muted)
rule(792)
text(36,751,'Иван Груздев.',29,bold=True)
text(36,723,'ML Engineer',19,accent)
text(36,702,'CV · LLM / VLM · OCR · NLP',9,muted)
c.drawImage(str(ROOT/'dist/assets/ivan-gruzdev.png'),469,701,90,90,mask='auto')
para(36,680,523,'Разрабатываю и внедряю ML-системы для промышленности, производства и ритейла: от подготовки данных и обучения до интеграции и поддержки в production.',9.2,13)
for x,value,subtitle,detail in [(36,'100 тыс.+','записей в LLM-аналитике','Запросы и аналитические отчёты'),(214,'95%','Accuracy · VLM','Тест на 1 000+ кадров'),(392,'50+','камер суммарно','По всем CV-проектам')]:
    c.setFillColor(panel);c.roundRect(x,576,167,63,5,fill=1,stroke=0)
    text(x+12,612,value,22,accent,True);text(x+12,597,subtitle,7.7,bold=True);text(x+12,585,detail,6.9,muted)

c.setFillColor(panel);c.roundRect(28,62,183,493,7,fill=1,stroke=0)
x=40;y=536
label(x,y,'01 / КОНТАКТЫ'); y-=20
for value in ['+7 (905) 148-48-91','ivan.gru.05@mail.ru']:
    text(x,y,value,8);y-=14
text(x,y,'ivangruuu.github.io',8,accent)
c.linkURL('https://ivangruuu.github.io/',(x,y-2,180,y+10),relative=0);y-=21
for value in ['Москва · офис / удалённо / гибрид','Полная занятость','От 150 000 руб. на руки']:
    text(x,y,value,7.3,accent if value.startswith('От') else muted);y-=12

y-=16;label(x,y,'02 / СТЕК');y-=15
stacks=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import c from './src/content.mjs'; console.log(JSON.stringify(c.stacks))"],cwd=ROOT))
for group,items in stacks:
    text(x,y,group,6.1,accent,True);y-=5
    y=para(x,y,158,' · '.join(items),7.0,10.1)-10

y-=3;label(x,y,'03 / ОБРАЗОВАНИЕ');y-=17
text(x,y,'МИРЭА',10,bold=True);y-=8
y=para(x,y,157,'Искусственный интеллект<br/>и машинное обучение',7.6,10.7)-4
text(x,y,'Бакалавриат · выпуск в 2027',7.2,muted);y-=17
for value in ['Samsung · AI и машинное зрение','Иннополис · DevOps','Курсы · 2024','Русский · родной / Английский · B1']:
    text(x,y,value,7.1,muted);y-=11
assert y>63, f'Sidebar overflows: {y}'

x=232;w=327;y=536
label(x,y,'04 / ОПЫТ РАБОТЫ');y-=23
text(x,y,'IT-Consulting “Smart Solutions”',13,bold=True);y-=18
text(x,y,'ML Engineer',10,accent,True);text(x+105,y,'08.2024 — настоящее время',7.5,muted);y-=13
y=para(x,y,w,'Коммерческие и корпоративные проекты для промышленности, производства и ритейла.',8.8,12)-9
for value in [
    '<b>Полный цикл ML:</b> подготовка и разметка данных, обучение, дообучение, оценка качества и внедрение.',
    '<b>CV и LLM/VLM:</b> RTSP-пайплайны, трекинг, ROI-логика; локальные модели и дообучение с LoRA/QLoRA.',
    '<b>Production:</b> API, PostgreSQL, бизнес-логика, оптимизация инференса, логирование, мониторинг и восстановление.'
]:
    y=para(x,y,w,value,8.6,12)-7

y-=9;label(x,y,'05 / КЛЮЧЕВЫЕ ПРОЕКТЫ');y-=22
projects=[
('LLM / Диалоговая аналитика',
 'Разработал систему анализа событий на базе LLM, работающую с <b>более чем 100 тыс. записей</b>. Запросы на естественном языке, интеграция с БД и автоматическое формирование отчётов сократили необходимость ручного анализа.'),
('VLM / Контроль технологических процессов',
 'С нуля разработал и внедрил систему на Qwen-VL. Анализ производственных кадров с интервалом около 3 минут. <b>Accuracy 95%</b> на эталонной тестовой выборке (Golden Dataset) из <b>1 000+ размеченных кадров</b>.'),
('CV / Автоматизация производства',
 'Разработал и внедрил решения для <b>50+ камер суммарно</b>: детекция, классификация, трекинг, оценка позы, подсчёт продукции и контроль операций. Полный цикл: данные, обучение, ROI-логика, БД и мониторинг.')]
for title,description in projects:
    text(x,y,title,9.2,accent,True);y-=9
    y=para(x,y,w,description,8.6,12.3)-18
assert y>62, f'Main column overflows: {y}'
rule(48)
text(36,31,'IVAN GRUZDEV',6.8,muted)
text(232,31,'Кейсы и примеры работ → ivangruuu.github.io',7.3,accent)
c.linkURL('https://ivangruuu.github.io/',(232,28,559,41),relative=0)
c.save()
version=hashlib.sha256(output.read_bytes()).hexdigest()[:10]
index=ROOT/'src/index.html';html=index.read_text();html,n=re.subn(r'(ivan-gruzdev-resume\.pdf\?v=)[^"\s]+',lambda m:m.group(1)+version,html);assert n==1;index.write_text(html)
print(f'Generated one-page PDF; main column bottom={y:.1f}; version={version}')
