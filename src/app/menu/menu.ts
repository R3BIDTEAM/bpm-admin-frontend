import { CoreMenu } from '@core/types'

export const menu: CoreMenu[] = [
  {
    id: 'home',
    title: 'Asignación de Trámites',
    translate: 'Asignación de Trámites',
    type: 'item',
    icon: '',
    url: 'main'
  },
  {
    id: 'gestion_brigadas',
    title: 'Gestion de Brigadas',
    translate: 'Gestion de Brigradas',
    type: 'collapsible',
    icon: '',
    children: [
      {
        id: 'brigadas',
        title: 'Brigadas',
        translate: 'Brigadas',
        type: 'item',
        url: 'brigadas',
        icon: 'circle',
      },
      {
        id: 'topografos',
        title: 'Topógrafos',
        translate: 'Topógrafos',
        type: 'item',
        url: 'topografos',
        icon: 'circle',
      },
      {
        id: 'cadeneros',
        title: 'Cadeneros',
        translate: 'Cadeneros',
        type: 'item',
        url: 'cadeneros',
        icon: 'circle',
      },
    ]
  },
  /*{
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
        url: 'expediente/alta',
        icon: 'circle',
      },
    ]
  }*/
]
