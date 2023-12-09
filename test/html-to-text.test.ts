import { compile } from 'html-to-text'

const convert = compile({
  preserveNewlines: true,
  decodeEntities: true
})

const result = convert(
  'LED-драйвер 40Вт для панели SPL-4-40 PF&gt;0.98 без пульсаций'
)

console.log(result)
