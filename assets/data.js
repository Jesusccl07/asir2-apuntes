/* Catálogo: asignatura → temas → materiales. Para añadir material: copia su .html a /temas/<asignatura>/ y añádelo en items. */
window.ASIR = {
  subjects: [
    { slug:'sad',  code:'SAD',  name:'Seguridad y Alta Disponibilidad', teacher:'Óscar Gómez García', color:'#FF3B30', icon:'shield',
      blurb:'Seguridad informática, amenazas y protección de sistemas.',
      topics:[ { n:1, title:'Tema 1', items:[ { id:'examen-tema-1', title:'Examen Tema 1', type:'Examen', desc:'Examen de repaso del Tema 1, con preguntas y autocorrección.', file:'temas/sad/examen-tema-1.html' } ] } ] },
    { slug:'ipei', code:'IPEII', name:'Itinerario Personal para la Empleabilidad II', teacher:'Gema Abad Rubio', color:'#FF9500', icon:'brief', blurb:'Orientación laboral y empleabilidad.', topics:[] },
    { slug:'ialp', code:'IALP', name:'Implantación de Aplicaciones Web — Lenguajes de Programación', teacher:'Alfonso José Padilla Navarrete', color:'#AF52DE', icon:'code', blurb:'Algoritmos, PSeInt y fundamentos de programación.', topics:[] },
    { slug:'pima', code:'PIMAS', name:'Proyecto Intermodular', teacher:'Manuel Peña Villanueva', color:'#FF2D78', icon:'rocket', blurb:'Proyecto final de ciclo.', topics:[] },
    { slug:'aso',  code:'ASO',  name:'Administración de Sistemas Operativos', teacher:'Alberto Montoro Gavilán', color:'#0A84FF', icon:'term',
      blurb:'Sistemas operativos, shell script y administración.',
      topics:[ { n:1, title:'Tema 1', items:[ { id:'tema-1', title:'Conceptos del Tema 1', type:'Apuntes', desc:'Conceptos del Tema 1 de Administración de Sistemas Operativos.', file:'temas/aso/tema-1.html' } ] },
        { n:2, title:'Tema 2 · Shell Script', items:[
        { id:'tema-2', title:'Teoría de Shell Script', type:'Apuntes', desc:'Bash de cero a funciones: esquemas, posits, tarjetas y laboratorios interactivos.', file:'temas/aso/tema-2.html#teoria' },
        { id:'tema-2-practica', title:'Red, SSH y configuración', type:'Práctica', desc:'Checklist de la MV, la red Host-Only, SSH y VS Code, y los 23 ejercicios resueltos.', file:'temas/aso/tema-2.html#practica' },
        { id:'tema-2-test', title:'Test Tema 2', type:'Test', desc:'Más de 200 preguntas en 3 niveles, con rachas, XP, modo examen y ranking.', file:'temas/aso/tema-2.html#test' } ] } ] },
    { slug:'sri',  code:'SRI',  name:'Servicios de Red e Internet', teacher:'Raúl', color:'#28B850', icon:'net', blurb:'Servicios de red, DNS, DHCP y más.', topics:[] },
    { slug:'iaw',  code:'IAW',  name:'Implantación de Aplicaciones Web', teacher:'Raúl', color:'#00B8D9', icon:'globe',
      blurb:'Servidores web, XAMPP, PHP y aplicaciones en la nube.',
      topics:[ { n:1, title:'Tema 1', items:[ { id:'test-tema-1', title:'Test Tema 1', type:'Test', desc:'Test del Tema 1 con ranking de puntuaciones.', file:'temas/iaw/test-tema-1.html' } ] } ] },
    { slug:'asgbd',code:'ASGBD',name:'Administración de Sistemas Gestores de Bases de Datos', teacher:'Javier García-Retamero Redondo', color:'#F2A900', icon:'db',
      blurb:'Oracle: arquitectura, CDB/PDB, instalación y gestión de espacio.',
      topics:[ { n:1, title:'Tema 1', items:[
        { id:'apuntes-oracle', title:'Apuntes Oracle', type:'Apuntes', desc:'Apuntes de teoría para el examen: arquitectura, CDB y PDB, espacio.', file:'temas/asgbd/apuntes-oracle.html' },
        { id:'oracle-docker', title:'Oracle en Docker', type:'Práctica', desc:'Instalación, arranque y parada de Oracle en Docker, con test y ranking.', file:'temas/asgbd/oracle-docker.html' },
        { id:'test-oracle', title:'Test Oracle', type:'Test', desc:'Test tipo examen con arquitectura, tests y ranking.', file:'temas/asgbd/test-oracle.html' } ] } ] },
    { slug:'herramientas', code:'EXTRA', name:'Herramientas', teacher:'', color:'#5E5CE6', icon:'cal',
      blurb:'Utilidades para organizar el curso.',
      topics:[ { n:1, title:'Organización', items:[ { id:'examenes', title:'Exámenes', type:'Herramienta', desc:'Agenda de exámenes con autorrelleno según tu horario.', file:'temas/herramientas/examenes.html', offset:84 } ] } ] }
  ]
};
