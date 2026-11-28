function TutorialLessons(Engine){
const lessons=[
 // id, variant, position, intended path, expected capture count, winner, localized title/instruction
 ['move','brandubh',{B5:1,D4:3,E3:2},['B5','E5'],0,0,
 ['Movement','Move the black piece along the row. Black plays first.','Передвижение','Передвинь чёрную фишку по горизонтали. Чёрные ходят первыми.','Movimiento','Mové la ficha negra en horizontal. Las negras empiezan.']],
 ['block','brandubh',{C3:2,C5:1,D4:3},['C3','C4'],0,0,
 ['Blocked paths','Pieces move like rooks: straight, never diagonally or through other pieces.','Препятствия','Фишки ходят по прямой, не по диагонали. Перепрыгивать другие фишки нельзя.','Obstáculos','Las fichas se mueven en línea recta, nunca en diagonal ni atravesando otras fichas.']],
 ['capture','brandubh',{C5:1,D5:2,E7:1,D3:3},['E7','E5'],1,0,
 ['Capture','Move next to the white piece to trap it between two black pieces.','Захват','Зажми белую фишку между двумя чёрными.','Captura','Encerrá la ficha blanca entre dos negras.']],
 ['defender','brandubh',{C5:2,D5:1,E7:2,D3:3},['E7','E5'],1,0,
 ['Defenders capture too','The same rule applies to both sides. Capture the black piece.','Захват защитниками','Правило одинаково для обеих сторон. Захвати чёрную фишку.','Captura de los defensores','La misma regla vale para ambos bandos. Capturá la ficha negra.']],
 ['cornerCapture','brandubh',{B1:2,C3:1,D4:3},['C3','C1'],1,0,
 ['Hostile squares','An empty restricted corner can replace one friendly piece in a capture.','Особые клетки','Пустой особый угол может заменить одну из твоих фишек при захвате.','Casillas hostiles','Una esquina especial vacía puede reemplazar una ficha propia en una captura.']],
 ['throne','brandubh',{D3:3,B5:1},['D3','D4'],0,0,
 ['The throne','Only the king may stop on the throne or special corners. Move him back to the throne.','Трон','На троне и особых углах может останавливаться только король. Верни его на трон.','El trono','Solo el rey puede detenerse en el trono o en las esquinas especiales. Volvé al trono.']],
 ['escape','brandubh',{A4:3,D6:1,F4:1},['A4','A7'],0,2,
 ['Escape through a corner','The white side wins when the king reaches a corner.','Побег через угол','Белые побеждают, если король достигает любого угла.','Escape por una esquina','Las blancas ganan cuando el rey llega a una esquina.']],
 ['edge','tablut',{E3:3,A5:1,G5:1},['E3','E1'],0,2,
 ['Escape through the edge','In Tablut and other edge-escape games, any outer square is enough.','Побег через край','В Tablut и других играх с краевым побегом достаточно любой клетки периметра.','Escape por el borde','En Tablut y otras variantes de escape por el borde, alcanza cualquier casilla del perímetro.']],
 ['weak','brandubh',{C5:3,B5:1,D7:1},['D7','D5'],1,1,
 ['Capture a weak king','Away from the throne, trap the king between two black pieces.','Захват слабого короля','Вдали от трона зажми короля между двумя чёрными фишками.','Captura del rey débil','Lejos del trono, encerrá al rey entre dos fichas negras.']],
 ['nearThrone','brandubh',{D5:3,C5:1,E5:1,D7:1},['D7','D6'],1,1,
 ['Next to the throne','The empty throne counts as one side. Surround the king on the other three sides.','Рядом с троном','Пустой трон считается одной стороной. Окружи короля с остальных трёх.','Junto al trono','El trono vacío cuenta como un lado. Rodeá al rey por los otros tres.']],
 ['onThrone','brandubh',{D4:3,C4:1,E4:1,D3:1,D7:1},['D7','D5'],1,1,
 ['On the throne','The king on the throne needs four surrounding attackers.','Король на троне','Для захвата короля на троне нужны четыре нападающих.','En el trono','Para capturar al rey en el trono hacen falta cuatro atacantes.']],
 ['strong','hnefatafl',{F8:3,E8:1,G8:1,F7:1,F11:1},['F11','F9'],1,1,
 ['The strong king','In Fetlar, Copenhagen and Berserk, an ordinary capture of the king away from the throne needs four attackers.','Сильный король','В Fetlar, Copenhagen и Berserk для обычного захвата короля вдали от трона нужны четыре нападающих.','El rey fuerte','En Fetlar, Copenhagen y Berserk, la captura normal del rey lejos del trono requiere cuatro atacantes.']],
 ['noThrone','ardri',{D6:1,C3:3},['D6','D4'],0,0,
 ['No throne','In Ard Rí and Tawlbwrdd, the central square is ordinary. Any piece can stop there.','Без трона','В Ard Rí и Tawlbwrdd центральная клетка обычная. На ней может стоять любая фишка.','Sin trono','En Ard Rí y Tawlbwrdd, la casilla central es normal. Cualquier ficha puede detenerse ahí.']],
 ['magpie','magpie',{A6:3,D4:1},['A6','A7'],0,2,
 ['Magpie: the king','The king moves only one square horizontally or vertically. Reach the corner.','Magpie: король','Король ходит только на одну клетку по горизонтали или вертикали. Доберись до угла.','Magpie: el rey','El rey avanza una sola casilla en horizontal o vertical. Llegá a la esquina.']],
 ['magpieEdge','magpie',{B7:3,C7:1,B5:1},['B5','B6'],1,1,
 ['Magpie: edge capture','The edge and empty corner can count as hostile sides. Complete the capture.','Magpie: захват у края','Край доски и пустой угол могут считаться враждебными сторонами. Захвати короля.','Magpie: captura en el borde','El borde y la esquina vacía pueden contar como lados hostiles. Completá la captura.']],
 ['commander','berserk',{D8:4,E8:2,F6:3},['D8','F8'],0,0,
 ['The commander','The black axe can jump one ordinary white soldier into the next empty allowed square. The jump itself does not capture.','Командир','Чёрная секира может перепрыгнуть одну обычную белую фишку на свободную разрешённую клетку. Сам прыжок не захватывает.','El comandante','La ficha negra con hacha puede saltar un soldado blanco hacia la siguiente casilla libre permitida. El salto por sí solo no captura.']],
 ['knight','berserk',{D8:5,E8:1,F6:3},['D8','F8'],1,0,
 ['The knight','The white sword can jump an ordinary black soldier and capture it.','Рыцарь','Белый меч может перепрыгнуть обычную чёрную фишку и захватить её.','El caballero','La ficha blanca con espada puede saltar un soldado negro y capturarlo.']],
 ['kingJump','berserk',{F6:3,F7:1},['F6','F8'],1,0,
 ['The king can jump','In Berserk the king can jump an ordinary attacker when starting or landing on a restricted square. Here the empty throne also helps capture.','Прыжок короля','В Berserk король может перепрыгнуть обычного нападающего с особой клетки или на неё. Здесь пустой трон помогает захватить фишку.','Salto del rey','En Berserk el rey puede saltar un atacante común desde o hacia una casilla especial. Acá el trono vacío también ayuda a capturar.']],
 ['chain','berserk',{B9:5,C9:1,E9:1,F6:3,J2:1},['B9','D9','F9'],2,0,
 ['Capture chains','After a capture, the same piece may make another capturing move. Capture both soldiers in one turn.','Цепочка захватов','После захвата той же фигурой можно сделать ещё один захват. Возьми обе фишки за один ход.','Capturas en cadena','Después de capturar, la misma ficha puede volver a capturar. Capturá los dos soldados en un turno.']],
 ['commanders','berserk',{D8:3,C8:4,E10:4},['E10','E8'],1,1,
 ['Two commanders','Away from the throne, two commanders can capture the king from opposite sides.','Два командира','Вдали от трона два командира могут захватить короля с противоположных сторон.','Dos comandantes','Lejos del trono, dos comandantes pueden capturar al rey desde lados opuestos.']],
 ['shield','copenhagen',{B11:2,C11:2,B10:1,C10:1,D9:1,F6:3},['D9','D11'],2,0,
 ['Shieldwall','Surround a row of at least two enemy soldiers at the edge: block both ends and every inward square. A free corner can serve as an end.','Стена щитов','Зажми ряд из двух или более врагов у края: перекрой оба конца и все клетки со стороны центра. Пустой угол может заменить одну фишку на конце.','Muro de escudos','Encerrá una fila de dos o más rivales en el borde: bloqueá los extremos y todas las casillas hacia el interior. Una esquina libre puede cerrar un extremo.']],
 ['fort','copenhagen',{D11:2,D10:2,E10:2,F9:2,G10:2,G11:2,E11:3,I3:1},['F9','F10'],0,2,
 ['Exit fort','A movable king at the edge can win inside a secure, uncapturable fort. Close the gap in the wall.','Выходная крепость','Король у края побеждает внутри защищённой крепости, если может двигаться, а её стену нельзя разрушить. Закрой брешь.','Fortaleza de escape','Un rey que puede moverse en el borde gana dentro de una fortaleza segura e inexpugnable. Cerrá el hueco.']],
 ['encircle','hnefatafl',{D8:1,E8:1,G8:1,H8:1,D7:1,H7:1,D6:1,H6:1,D5:1,H5:1,D4:1,E4:1,F4:1,G4:1,H4:1,F11:1,F6:3,F7:2},['F11','F8'],0,1,
 ['Encirclement','In games with the encirclement rule, black wins by cutting every defender off from the outer edge. Close the ring.','Окружение','В играх с правилом окружения чёрные побеждают, отрезав всех защитников от края. Замкни кольцо.','Cerco','En las variantes con regla de cerco, las negras ganan si aíslan a todos los defensores del borde. Cerrá el anillo.']],
 ['quizCapture','brandubh',{B3:1,C3:2,D6:1,E4:3},['D6','D3'],1,0,
 ['Your turn: capture','Capture a white soldier without a highlighted answer.','Задание: захват','Захвати белую фишку без подсветки ответа.','Desafío: captura','Capturá una ficha blanca sin que se marque la solución.'],true],
 ['quizEscape','tablut',{D4:3,E5:1,A5:1},['D4','D1'],0,2,
 ['Your turn: escape','Win with the white king in one move.','Задание: побег','Победи за белого короля одним ходом.','Desafío: escape','Ganá con el rey blanco en una jugada.'],true]
];
return lessons.map(([id,variant,position,path,captures,winner,copy,quiz=false])=>{
 const engine=Engine(variant),index=s=>(engine.n-Number(s.slice(1)))*engine.n+s.charCodeAt(0)-65,b=Array(engine.L).fill(0);
 for(const [s,p] of Object.entries(position))b[index(s)]=p;
 const m=path.map(index),side=engine.S[b[m[0]]];
 if(!engine.moves(b,side).some(q=>q.join()===m.join()))throw Error('Illegal tutorial lesson: '+id);
 const r=engine.apply(b,m);
 if(r.cap.length!==captures||r.win!==winner)throw Error('Wrong tutorial outcome: '+id);
 return {id,variant,engine,b,path:m,side,captures,winner,copy,quiz};
});
}
