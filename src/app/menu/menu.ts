import { CoreMenu } from '@core/types'

export const menu: CoreMenu[] = [
  {
    id: 'home',
    title: 'Bandeja de Tareas',
    translate: 'Bandeja de Tareas',
    type: 'item',
    icon: 'home',
    url: 'home'
  },
  {
    id: 'registro',
    title: 'Registro',
    translate: 'Registro',
    type: 'collapsible',
    icon: 'file-text',
    children: [
      {
        id: 'alta-expediente',
        title: 'Alta de Expediente',
        translate: 'Alta de Expediente',
        type: 'item',
        url: 'registro/alta-expediente',
        icon: 'circle',
      },
    ]
  }
]
