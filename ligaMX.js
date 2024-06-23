import { chromium } from 'playwright'
import pc from 'picocolors'

// Mostrando resultados de la liga mx extraidos de una pagina web
// Ultima jornada y tabla general
// Usando NodeJS

// TODO: meter el manejo de datos para la renderizacion dentro de la funcion tabla,
// o pasarle el res a tabla y despues a mostrar tabla

const ordenarArray = (datos) => {
  const data = datos[0].split(',')
  let conteo = 0
  let columnaArray = []
  const arrayOrdenado = []

  for (const d of data) {
    if (conteo === 9) {
      const objeto = {
        pos: columnaArray[0],
        equipo: columnaArray[1],
        jj: columnaArray[2],
        jg: columnaArray[3],
        je: columnaArray[4],
        jp: columnaArray[5],
        gf: columnaArray[6],
        gc: columnaArray[7],
        dg: columnaArray[8],
        pts: d
      }
      arrayOrdenado.push(objeto)
      columnaArray = []
      conteo = 0
      continue
    }

    columnaArray.push(d)
    conteo++
  }

  return arrayOrdenado
//   for (const obj of arrayOrdenado) {
//     if ('' + obj.pos === 'POS') {
//       console.log(`${obj.pos.padEnd(10)} ${obj.equipo.padEnd(25)} ${obj.jj.padEnd(10)} ${obj.jg.padEnd(10)} ${obj.je.padEnd(10)} ${obj.jp.padEnd(10)} ${obj.gf.padEnd(10)} ${obj.gc.padEnd(10)} ${obj.dg.padEnd(10)} ${obj.pts}`)
//     } else if ('' + obj.pos > 0 && '' + obj.pos < 7) {
//       console.log(`${pc.green(obj.pos.padEnd(10))} ${obj.equipo.padEnd(25)} ${obj.jj.padEnd(10)} ${obj.jg.padEnd(10)} ${obj.je.padEnd(10)} ${obj.jp.padEnd(10)} ${obj.gf.padEnd(10)} ${obj.gc.padEnd(10)} ${obj.dg.padEnd(10)} ${obj.pts}`)
//     } else if ('' + obj.pos > 6 && '' + obj.pos < 11) {
//       console.log(`${pc.yellow(obj.pos.padEnd(10))} ${obj.equipo.padEnd(25)} ${obj.jj.padEnd(10)} ${obj.jg.padEnd(10)} ${obj.je.padEnd(10)} ${obj.jp.padEnd(10)} ${obj.gf.padEnd(10)} ${obj.gc.padEnd(10)} ${obj.dg.padEnd(10)} ${obj.pts}`)
//     } else {
//       console.log(`${pc.red(obj.pos.padEnd(10))} ${obj.equipo.padEnd(25)} ${obj.jj.padEnd(10)} ${obj.jg.padEnd(10)} ${obj.je.padEnd(10)} ${obj.jp.padEnd(10)} ${obj.gf.padEnd(10)} ${obj.gc.padEnd(10)} ${obj.dg.padEnd(10)} ${obj.pts}`)
//     }
//   }
}

const tabla = async (res) => {
  const navegador = await chromium.launch()
  const pagina = await navegador.newPage()

  try {
    await pagina.goto('https://www.mediotiempo.com/futbol/liga-mx/tabla-general')
  } catch (e) {
    console.log('Ocurrio un error: ', e)
  }

  await pagina.waitForSelector('.ctr-stadistics-header__tr')

  const tablaPosisiones = await pagina.evaluate(() => {
    const arrayTitulos = []
    const arrayInfo = []

    const columnaTitulos = document.querySelector('body > div.body-content > div > div > div.ctr-stadistics-header > div.ctr-stadistics-header__body > table > tbody > tr:nth-child(1)')
    columnaTitulos.querySelectorAll('th').forEach(t => {
      arrayTitulos.push(t.textContent)
    })

    document.querySelectorAll('.ctr-stadistics-header__tr > td').forEach(c => {
      arrayInfo.push(c.textContent)
    })

    const arrayFinal = []
    for (const valor of arrayInfo) {
      arrayFinal.push(valor.trim())
    }

    return [arrayTitulos + ',' + arrayFinal]
  })
  await navegador.close()

  const datos = ordenarArray(tablaPosisiones)
  res.render("tabla", {datos})

//   mostrarTabla(tablaPosisiones)
}

const resultados = async (res) => {
  const navegador = await chromium.launch()
  const pagina = await navegador.newPage()

  try {
    await pagina.goto('https://www.mediotiempo.com/futbol/liga-mx')
  } catch (e) {
    console.log('Ocurrio un error: ', e)
  }

  const tablaTotal = await pagina.evaluate(() => {
    const columnaCompleta = document.querySelectorAll('.sn-league-stadistics__row')

    const datosLimpios = []

    columnaCompleta.forEach(d => {
      const todosLocal = d.querySelectorAll('.sn-league-stadistics__cell--teams > .sn-league-stadistics__first-team > div > a > span')
      const todosMarcador = d.querySelectorAll('.sn-league-stadistics__cell--teams > .sn-league-stadistics__result-team > span')
      const todosVisitante = d.querySelectorAll('.sn-league-stadistics__cell--teams > .sn-league-stadistics__second-team > div > a > span')

      let locales = ""
      for (const local of todosLocal) {
        locales = local.textContent
      }

      let marcadores = ""
      for (const marcador of todosMarcador) {
        marcadores = marcador.textContent
      }

      let visitantes = ""
      for (const visitante of todosVisitante) {
        visitantes = visitante.textContent
      }

      const objeto = { locales, marcadores, visitantes }
      datosLimpios.push(objeto)
    })

    return datosLimpios
  })
  await navegador.close()

  res.render("resultados", {resultados: tablaTotal})

//   console.log(tablaTotal)
//   mostrarResultados(tablaTotal)

}

export {resultados, tabla}