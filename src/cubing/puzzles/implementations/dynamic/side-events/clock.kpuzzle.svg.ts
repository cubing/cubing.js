export const clockSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 480 240" preserveAspectRatio="xMidYMid meet">
  <title>clock</title>
  <defs>
    <g id="hand" transform="translate(-20, -20)">
      <path d="M19.9995197,2.22079449 L23.8791657,19.0203611 C23.9580836,19.3338406 24,19.6620253 24,20 C24,22.209139 22.209139,24 20,24 C17.790861,24 16,22.209139 16,20 C16,19.6620253 16.0419164,19.3338406 16.1208343,19.0203611 L19.9995197,2.22079449 Z"></path>
    </g>
    <g id="cardinal_hour">
      <circle cx="0" cy="-24" r="3"></circle>
    </g>
    <g id="background_cardinal_hours" style="fill: #77889999">
      <circle cx="0" cy="24" r="1.5"></circle>
      <circle cx="-24" cy="0" r="1.5"></circle>
      <circle cx="24" cy="0" r="1.5"></circle>
      <circle cx="0" cy="-24" r="1.5"></circle>
    </g>
    <g id="background_face_hours">
      <g>
        <use href="#background_cardinal_hours"/>
      </g>
      <g transform="rotate(30)">
        <use href="#background_cardinal_hours"/>
      </g>
      <g  transform="rotate(60)">
        <use href="#background_cardinal_hours"/>
      </g>
    </g>
    <g id="peg">
      <circle id="PEG4" cx="0" cy="0" r="8"></circle>
    </g>
    <g id="frame" transform="translate(-24, -24)">
      <path stroke="#000000" d="M120,20 C137.495665,20 153.941932,24.4930026 168.247913,32.3881183 C171.855881,30.8514056 175.828512,30 180,30 C196.568542,30 210,43.4314575 210,60 C210,64.1714878 209.148594,68.1441192 207.610077,71.7536009 C215.506997,86.0580678 220,102.504335 220,120 C220,137.495665 215.506997,153.941932 207.611882,168.247913 C209.148594,171.855881 210,175.828512 210,180 C210,196.568542 196.568542,210 180,210 C175.828512,210 171.855881,209.148594 168.246399,207.610077 C153.941932,215.506997 137.495665,220 120,220 C102.504335,220 86.0580678,215.506997 71.7520869,207.611882 C68.1441192,209.148594 64.1714878,210 60,210 C43.4314575,210 30,196.568542 30,180 C30,175.828512 30.8514056,171.855881 32.3899234,168.246399 C24.4930026,153.941932 20,137.495665 20,120 C20,102.504335 24.4930026,86.0580678 32.3881183,71.7520869 C30.8514056,68.1441192 30,64.1714878 30,60 C30,43.4314575 43.4314575,30 60,30 C64.1714878,30 68.1441192,30.8514056 71.7536009,32.3899234 C86.0580678,24.4930026 102.504335,20 120,20 Z"></path>
    </g>
  </defs>
  <g>
    <g transform="translate(24, 24)">
      <use href="#frame" id="FRAME-l0-o0" style="fill: #113366"/>
      <use href="#peg" transform="translate(66, 66)" style="fill: #446699"/>
      <use href="#peg" transform="translate(126, 66)" style="fill: #446699"/>
      <use href="#peg" transform="translate(126, 126)" style="fill: #446699"/>
      <use href="#peg" transform="translate(66, 126)" style="fill: #446699"/>

      <g transform="translate(36, 36)">
        <circle id="FACES-l0-o0" stroke="#000000" style="fill: #CCDDEE" r="20"></circle>
        <use href="#background_face_hours"/>
        <g>
          <use id="HOUR_MARKS-l0-o0" href="#cardinal_hour" transform="rotate(0)" style="fill: #FFCC44"/>
          <use id="HOUR_MARKS-l0-o1" href="#cardinal_hour" transform="rotate(90)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l0-o2" href="#cardinal_hour" transform="rotate(180)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l0-o3" href="#cardinal_hour" transform="rotate(270)" style="fill: #0000"/>
        </g>
        <g>
          <use id="DIALS-l0-o0"  href="#hand" transform="rotate(0)" style="fill: #CC0000"/>
          <use id="DIALS-l0-o1"  href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l0-o2"  href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l0-o3"  href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l0-o4"  href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l0-o5"  href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l0-o6"  href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l0-o7"  href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l0-o8"  href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l0-o9"  href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l0-o10" href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l0-o11" href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(96, 36)">
        <circle id="FACES-l1-o0" stroke="#000000" style="fill: #CCDDEE" r="20"></circle>
        <use href="#background_face_hours"/>
        <g>
          <use id="HOUR_MARKS-l1-o0" href="#cardinal_hour" transform="rotate(0)" style="fill: #FFCC44"/>
          <use id="HOUR_MARKS-l1-o1" href="#cardinal_hour" transform="rotate(90)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l1-o2" href="#cardinal_hour" transform="rotate(180)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l1-o3" href="#cardinal_hour" transform="rotate(270)" style="fill: #0000"/>
        </g>
        <g>
          <use id="DIALS-l1-o0"  href="#hand" transform="rotate(0)" style="fill: #CC0000"/>
          <use id="DIALS-l1-o1"  href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l1-o2"  href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l1-o3"  href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l1-o4"  href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l1-o5"  href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l1-o6"  href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l1-o7"  href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l1-o8"  href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l1-o9"  href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l1-o10" href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l1-o11" href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(156, 36)">
        <circle id="FACES-l2-o0" stroke="#000000" style="fill: #CCDDEE" r="20"></circle>
        <use href="#background_face_hours"/>
        <g>
          <use id="HOUR_MARKS-l2-o0" href="#cardinal_hour" transform="rotate(0)" style="fill: #FFCC44"/>
          <use id="HOUR_MARKS-l2-o1" href="#cardinal_hour" transform="rotate(90)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l2-o2" href="#cardinal_hour" transform="rotate(180)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l2-o3" href="#cardinal_hour" transform="rotate(270)" style="fill: #0000"/>
        </g>
        <g>
          <use id="DIALS-l2-o0"  href="#hand" transform="rotate(0)" style="fill: #CC0000"/>
          <use id="DIALS-l2-o1"  href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l2-o2"  href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l2-o3"  href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l2-o4"  href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l2-o5"  href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l2-o6"  href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l2-o7"  href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l2-o8"  href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l2-o9"  href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l2-o10" href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l2-o11" href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(36, 96)">
        <circle id="FACES-l3-o0" stroke="#000000" style="fill: #CCDDEE" r="20"></circle>
        <use href="#background_face_hours"/>
        <g>
          <use id="HOUR_MARKS-l3-o0" href="#cardinal_hour" transform="rotate(0)" style="fill: #FFCC44"/>
          <use id="HOUR_MARKS-l3-o1" href="#cardinal_hour" transform="rotate(90)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l3-o2" href="#cardinal_hour" transform="rotate(180)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l3-o3" href="#cardinal_hour" transform="rotate(270)" style="fill: #0000"/>
        </g>
        <g>
          <use id="DIALS-l3-o0"  href="#hand" transform="rotate(0)" style="fill: #CC0000"/>
          <use id="DIALS-l3-o1"  href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l3-o2"  href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l3-o3"  href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l3-o4"  href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l3-o5"  href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l3-o6"  href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l3-o7"  href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l3-o8"  href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l3-o9"  href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l3-o10" href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l3-o11" href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(96, 96)">
        <circle id="FACES-l4-o0" stroke="#000000" style="fill: #CCDDEE" r="20"></circle>
        <use href="#background_face_hours"/>
        <g>
          <use id="HOUR_MARKS-l4-o0" href="#cardinal_hour" transform="rotate(0)" style="fill: #FFCC44"/>
          <use id="HOUR_MARKS-l4-o1" href="#cardinal_hour" transform="rotate(90)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l4-o2" href="#cardinal_hour" transform="rotate(180)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l4-o3" href="#cardinal_hour" transform="rotate(270)" style="fill: #0000"/>
        </g>
        <g>
          <use id="DIALS-l4-o0"  href="#hand" transform="rotate(0)" style="fill: #CC0000"/>
          <use id="DIALS-l4-o1"  href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l4-o2"  href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l4-o3"  href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l4-o4"  href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l4-o5"  href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l4-o6"  href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l4-o7"  href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l4-o8"  href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l4-o9"  href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l4-o10" href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l4-o11" href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(156, 96)">
        <circle id="FACES-l5-o0" stroke="#000000" style="fill: #CCDDEE" r="20"></circle>
        <use href="#background_face_hours"/>
        <g>
          <use id="HOUR_MARKS-l5-o0" href="#cardinal_hour" transform="rotate(0)" style="fill: #FFCC44"/>
          <use id="HOUR_MARKS-l5-o1" href="#cardinal_hour" transform="rotate(90)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l5-o2" href="#cardinal_hour" transform="rotate(180)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l5-o3" href="#cardinal_hour" transform="rotate(270)" style="fill: #0000"/>
        </g>
        <g>
          <use id="DIALS-l5-o0"  href="#hand" transform="rotate(0)" style="fill: #CC0000"/>
          <use id="DIALS-l5-o1"  href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l5-o2"  href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l5-o3"  href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l5-o4"  href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l5-o5"  href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l5-o6"  href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l5-o7"  href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l5-o8"  href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l5-o9"  href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l5-o10" href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l5-o11" href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(36, 156)">
        <circle id="FACES-l6-o0" stroke="#000000" style="fill: #CCDDEE" r="20"></circle>
        <use href="#background_face_hours"/>
        <g>
          <use id="HOUR_MARKS-l6-o0" href="#cardinal_hour" transform="rotate(0)" style="fill: #FFCC44"/>
          <use id="HOUR_MARKS-l6-o1" href="#cardinal_hour" transform="rotate(90)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l6-o2" href="#cardinal_hour" transform="rotate(180)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l6-o3" href="#cardinal_hour" transform="rotate(270)" style="fill: #0000"/>
        </g>
        <g>
          <use id="DIALS-l6-o0"  href="#hand" transform="rotate(0)" style="fill: #CC0000"/>
          <use id="DIALS-l6-o1"  href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l6-o2"  href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l6-o3"  href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l6-o4"  href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l6-o5"  href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l6-o6"  href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l6-o7"  href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l6-o8"  href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l6-o9"  href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l6-o10" href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l6-o11" href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(96, 156)">
        <circle id="FACES-l7-o0" stroke="#000000" style="fill: #CCDDEE" r="20"></circle>
        <use href="#background_face_hours"/>
        <g>
          <use id="HOUR_MARKS-l7-o0" href="#cardinal_hour" transform="rotate(0)" style="fill: #FFCC44"/>
          <use id="HOUR_MARKS-l7-o1" href="#cardinal_hour" transform="rotate(90)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l7-o2" href="#cardinal_hour" transform="rotate(180)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l7-o3" href="#cardinal_hour" transform="rotate(270)" style="fill: #0000"/>
        </g>
        <g>
          <use id="DIALS-l7-o0"  href="#hand" transform="rotate(0)" style="fill: #CC0000"/>
          <use id="DIALS-l7-o1"  href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l7-o2"  href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l7-o3"  href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l7-o4"  href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l7-o5"  href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l7-o6"  href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l7-o7"  href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l7-o8"  href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l7-o9"  href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l7-o10" href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l7-o11" href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(156, 156)">
        <circle id="FACES-l8-o0" stroke="#000000" style="fill: #CCDDEE" r="20"></circle>
        <use href="#background_face_hours"/>
        <g>
          <use id="HOUR_MARKS-l8-o0" href="#cardinal_hour" transform="rotate(0)" style="fill: #FFCC44"/>
          <use id="HOUR_MARKS-l8-o1" href="#cardinal_hour" transform="rotate(90)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l8-o2" href="#cardinal_hour" transform="rotate(180)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l8-o3" href="#cardinal_hour" transform="rotate(270)" style="fill: #0000"/>
        </g>
        <g>
          <use id="DIALS-l8-o0"  href="#hand" transform="rotate(0)" style="fill: #CC0000"/>
          <use id="DIALS-l8-o1"  href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l8-o2"  href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l8-o3"  href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l8-o4"  href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l8-o5"  href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l8-o6"  href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l8-o7"  href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l8-o8"  href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l8-o9"  href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l8-o10" href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l8-o11" href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
    </g>
    <g transform="translate(264, 24) scale(0.8)" transform-origin="96 96">
      <g transform="translate(32, 200)">
        <rect width="128" height="24" fill="#D9D9D9"/>
        <path d="M25.965 19.16C25.2317 19.16 24.4917 19.1333 23.745 19.08C22.9983 19.04 22.345 18.9467 21.785 18.8V5.34C22.0783 5.28667 22.3917 5.24 22.725 5.2C23.0583 5.14667 23.3983 5.10667 23.745 5.08C24.0917 5.05333 24.4317 5.03333 24.765 5.02C25.1117 5.00667 25.4383 5 25.745 5C26.585 5 27.365 5.06667 28.085 5.2C28.805 5.32 29.425 5.52667 29.945 5.82C30.4783 6.11333 30.8917 6.5 31.185 6.98C31.4783 7.46 31.625 8.05333 31.625 8.76C31.625 9.41333 31.465 9.97333 31.145 10.44C30.8383 10.9067 30.405 11.28 29.845 11.56C30.685 11.84 31.305 12.2533 31.705 12.8C32.105 13.3467 32.305 14.04 32.305 14.88C32.305 16.3067 31.785 17.38 30.745 18.1C29.705 18.8067 28.1117 19.16 25.965 19.16ZM24.265 12.76V16.98C24.545 17.0067 24.845 17.0267 25.165 17.04C25.485 17.0533 25.7783 17.06 26.045 17.06C26.565 17.06 27.045 17.0267 27.485 16.96C27.9383 16.8933 28.325 16.78 28.645 16.62C28.9783 16.4467 29.2383 16.22 29.425 15.94C29.625 15.66 29.725 15.3 29.725 14.86C29.725 14.0733 29.4383 13.5267 28.865 13.22C28.2917 12.9133 27.4983 12.76 26.485 12.76H24.265ZM24.265 10.78H26.045C27.005 10.78 27.7583 10.6467 28.305 10.38C28.8517 10.1 29.125 9.60667 29.125 8.9C29.125 8.23333 28.8383 7.76 28.265 7.48C27.705 7.2 26.9717 7.06 26.065 7.06C25.6783 7.06 25.3317 7.06667 25.025 7.08C24.7317 7.09333 24.4783 7.11333 24.265 7.14V10.78ZM41.9735 19C41.8562 18.616 41.7229 18.2213 41.5735 17.816C41.4349 17.4107 41.2962 17.0053 41.1575 16.6H36.8375C36.6989 17.0053 36.5549 17.4107 36.4055 17.816C36.2669 18.2213 36.1389 18.616 36.0215 19H33.4295C33.8455 17.8053 34.2402 16.7013 34.6135 15.688C34.9869 14.6747 35.3495 13.72 35.7015 12.824C36.0642 11.928 36.4162 11.08 36.7575 10.28C37.1095 9.46933 37.4722 8.68 37.8455 7.912H40.2295C40.5922 8.68 40.9495 9.46933 41.3015 10.28C41.6535 11.08 42.0055 11.928 42.3575 12.824C42.7202 13.72 43.0882 14.6747 43.4615 15.688C43.8349 16.7013 44.2295 17.8053 44.6455 19H41.9735ZM38.9815 10.424C38.9282 10.584 38.8482 10.8027 38.7415 11.08C38.6349 11.3573 38.5122 11.6773 38.3735 12.04C38.2349 12.4027 38.0802 12.8027 37.9095 13.24C37.7495 13.6773 37.5842 14.136 37.4135 14.616H40.5655C40.3949 14.136 40.2295 13.6773 40.0695 13.24C39.9095 12.8027 39.7549 12.4027 39.6055 12.04C39.4669 11.6773 39.3442 11.3573 39.2375 11.08C39.1309 10.8027 39.0455 10.584 38.9815 10.424ZM50.7305 19.224C48.9279 19.224 47.5519 18.7227 46.6025 17.72C45.6639 16.7173 45.1945 15.2933 45.1945 13.448C45.1945 12.5307 45.3385 11.7147 45.6265 11C45.9145 10.2747 46.3092 9.66667 46.8105 9.176C47.3119 8.67467 47.9092 8.296 48.6025 8.04C49.2959 7.784 50.0479 7.656 50.8585 7.656C51.3279 7.656 51.7545 7.69333 52.1385 7.768C52.5225 7.832 52.8585 7.912 53.1465 8.008C53.4345 8.09333 53.6745 8.184 53.8665 8.28C54.0585 8.376 54.1972 8.45067 54.2825 8.504L53.5625 10.52C53.2212 10.3387 52.8212 10.184 52.3625 10.056C51.9145 9.928 51.4025 9.864 50.8265 9.864C50.4425 9.864 50.0639 9.928 49.6905 10.056C49.3279 10.184 49.0025 10.392 48.7145 10.68C48.4372 10.9573 48.2132 11.32 48.0425 11.768C47.8719 12.216 47.7865 12.76 47.7865 13.4C47.7865 13.912 47.8399 14.392 47.9465 14.84C48.0639 15.2773 48.2452 15.656 48.4905 15.976C48.7465 16.296 49.0772 16.552 49.4825 16.744C49.8879 16.9253 50.3785 17.016 50.9545 17.016C51.3172 17.016 51.6425 16.9947 51.9305 16.952C52.2185 16.9093 52.4745 16.8613 52.6985 16.808C52.9225 16.744 53.1199 16.6747 53.2905 16.6C53.4612 16.5253 53.6159 16.456 53.7545 16.392L54.4425 18.392C54.0905 18.6053 53.5945 18.7973 52.9545 18.968C52.3145 19.1387 51.5732 19.224 50.7305 19.224ZM62.5935 19C62.3695 18.6373 62.1029 18.248 61.7935 17.832C61.4949 17.4053 61.1642 16.984 60.8015 16.568C60.4495 16.1413 60.0815 15.736 59.6975 15.352C59.3135 14.9573 58.9295 14.6107 58.5455 14.312V19H56.0495V7.912H58.5455V12.104C59.1962 11.4213 59.8469 10.712 60.4975 9.976C61.1589 9.22933 61.7722 8.54133 62.3375 7.912H65.2975C64.5402 8.808 63.7775 9.672 63.0095 10.504C62.2522 11.336 61.4522 12.1733 60.6095 13.016C61.4949 13.752 62.3482 14.6267 63.1695 15.64C64.0015 16.6533 64.7962 17.7733 65.5535 19H62.5935ZM75.5317 17.12C76.4384 17.12 77.0984 16.9667 77.5117 16.66C77.9251 16.3533 78.1317 15.92 78.1317 15.36C78.1317 15.0267 78.0584 14.74 77.9117 14.5C77.7784 14.26 77.5784 14.0467 77.3117 13.86C77.0584 13.66 76.7451 13.48 76.3717 13.32C75.9984 13.1467 75.5717 12.98 75.0917 12.82C74.6117 12.6467 74.1451 12.46 73.6917 12.26C73.2517 12.0467 72.8584 11.7867 72.5117 11.48C72.1784 11.1733 71.9051 10.8067 71.6917 10.38C71.4917 9.95333 71.3917 9.44 71.3917 8.84C71.3917 7.58667 71.8251 6.60667 72.6917 5.9C73.5584 5.18 74.7384 4.82 76.2317 4.82C77.0984 4.82 77.8651 4.92 78.5317 5.12C79.2117 5.30667 79.7451 5.51333 80.1317 5.74L79.3517 7.78C78.8984 7.52667 78.3984 7.33333 77.8517 7.2C77.3184 7.06667 76.7651 7 76.1917 7C75.5117 7 74.9784 7.14 74.5917 7.42C74.2184 7.7 74.0317 8.09333 74.0317 8.6C74.0317 8.90667 74.0917 9.17333 74.2117 9.4C74.3451 9.61333 74.5251 9.80667 74.7517 9.98C74.9917 10.1533 75.2651 10.3133 75.5717 10.46C75.8917 10.6067 76.2384 10.7467 76.6117 10.88C77.2651 11.12 77.8451 11.3667 78.3517 11.62C78.8717 11.86 79.3051 12.1533 79.6517 12.5C80.0117 12.8333 80.2851 13.2333 80.4717 13.7C80.6584 14.1533 80.7517 14.7067 80.7517 15.36C80.7517 16.6133 80.3051 17.5867 79.4117 18.28C78.5317 18.96 77.2384 19.3 75.5317 19.3C74.9584 19.3 74.4317 19.26 73.9517 19.18C73.4851 19.1133 73.0651 19.0267 72.6917 18.92C72.3317 18.8133 72.0184 18.7067 71.7517 18.6C71.4851 18.48 71.2717 18.3733 71.1117 18.28L71.8517 16.22C72.2117 16.42 72.6984 16.62 73.3117 16.82C73.9251 17.02 74.6651 17.12 75.5317 17.12ZM82.5925 7.912H85.0885V19H82.5925V7.912ZM90.151 16.968C90.2683 16.9787 90.4017 16.9893 90.551 17C90.711 17 90.8977 17 91.111 17C92.359 17 93.2817 16.6853 93.879 16.056C94.487 15.4267 94.791 14.5573 94.791 13.448C94.791 12.2853 94.503 11.4053 93.927 10.808C93.351 10.2107 92.439 9.912 91.191 9.912C91.0203 9.912 90.8443 9.91733 90.663 9.928C90.4817 9.928 90.311 9.93867 90.151 9.96V16.968ZM97.367 13.448C97.367 14.408 97.2177 15.2453 96.919 15.96C96.6203 16.6747 96.1937 17.2667 95.639 17.736C95.095 18.2053 94.4283 18.5573 93.639 18.792C92.8497 19.0267 91.9643 19.144 90.983 19.144C90.535 19.144 90.0123 19.1227 89.415 19.08C88.8177 19.048 88.231 18.9733 87.655 18.856V8.056C88.231 7.94933 88.8283 7.88 89.447 7.848C90.0763 7.80533 90.615 7.784 91.063 7.784C92.0123 7.784 92.871 7.89067 93.639 8.104C94.4177 8.31733 95.0843 8.65333 95.639 9.112C96.1937 9.57067 96.6203 10.1573 96.919 10.872C97.2177 11.5867 97.367 12.4453 97.367 13.448ZM99.4519 19V7.912H106.94V10.008H101.948V12.184H106.38V14.232H101.948V16.904H107.308V19H99.4519Z" fill="black"/>
      </g>
      <use href="#frame" id="FRAME-l0-o1" style="fill: #CCDDEE"/>

      <use href="#peg" transform="translate(66, 66)" style="fill: #88AACC"/>
      <use href="#peg" transform="translate(126, 66)" style="fill: #88AACC"/>
      <use href="#peg" transform="translate(126, 126)" style="fill: #88AACC"/>
      <use href="#peg" transform="translate(66, 126)" style="fill: #88AACC"/>

      <g transform="translate(36, 36)">
        <circle id="FACES-l9-o0" stroke="#000000" style="fill: #113366" r="20"></circle>
        <use href="#background_face_hours"/>
        <g>
          <use id="HOUR_MARKS-l9-o0" href="#cardinal_hour" transform="rotate(0)" style="fill: #CC6600"/>
          <use id="HOUR_MARKS-l9-o1" href="#cardinal_hour" transform="rotate(90)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l9-o2" href="#cardinal_hour" transform="rotate(180)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l9-o3" href="#cardinal_hour" transform="rotate(270)" style="fill: #0000"/>
        </g>
        <g>
          <use id="DIALS-l9-o0"  href="#hand" transform="rotate(0)" style="fill: #FFCC44"/>
          <use id="DIALS-l9-o1"  href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l9-o2"  href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l9-o3"  href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l9-o4"  href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l9-o5"  href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l9-o6"  href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l9-o7"  href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l9-o8"  href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l9-o9"  href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l9-o10" href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l9-o11" href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(96, 36)">
        <circle id="FACES-l10-o0" stroke="#000000" style="fill: #113366" r="20"></circle>
        <use href="#background_face_hours"/>
        <g>
          <use id="HOUR_MARKS-l10-o0" href="#cardinal_hour" transform="rotate(0)" style="fill: #CC6600"/>
          <use id="HOUR_MARKS-l10-o1" href="#cardinal_hour" transform="rotate(90)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l10-o2" href="#cardinal_hour" transform="rotate(180)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l10-o3" href="#cardinal_hour" transform="rotate(270)" style="fill: #0000"/>
        </g>
        <g>
          <use id="DIALS-l10-o0"  href="#hand" transform="rotate(0)" style="fill: #FFCC44"/>
          <use id="DIALS-l10-o1"  href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l10-o2"  href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l10-o3"  href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l10-o4"  href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l10-o5"  href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l10-o6"  href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l10-o7"  href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l10-o8"  href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l10-o9"  href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l10-o10" href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l10-o11" href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(156, 36)">
        <circle id="FACES-l11-o0" stroke="#000000" style="fill: #113366" r="20"></circle>
        <use href="#background_face_hours"/>
        <g>
          <use id="HOUR_MARKS-l11-o0" href="#cardinal_hour" transform="rotate(0)" style="fill: #CC6600"/>
          <use id="HOUR_MARKS-l11-o1" href="#cardinal_hour" transform="rotate(90)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l11-o2" href="#cardinal_hour" transform="rotate(180)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l11-o3" href="#cardinal_hour" transform="rotate(270)" style="fill: #0000"/>
        </g>
        <g>
          <use id="DIALS-l11-o0"  href="#hand" transform="rotate(0)" style="fill: #FFCC44"/>
          <use id="DIALS-l11-o1"  href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l11-o2"  href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l11-o3"  href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l11-o4"  href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l11-o5"  href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l11-o6"  href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l11-o7"  href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l11-o8"  href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l11-o9"  href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l11-o10" href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l11-o11" href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(36, 96)">
        <circle id="FACES-l12-o0" stroke="#000000" style="fill: #113366" r="20"></circle>
        <use href="#background_face_hours"/>
        <g>
          <use id="HOUR_MARKS-l12-o0" href="#cardinal_hour" transform="rotate(0)" style="fill: #CC6600"/>
          <use id="HOUR_MARKS-l12-o1" href="#cardinal_hour" transform="rotate(90)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l12-o2" href="#cardinal_hour" transform="rotate(180)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l12-o3" href="#cardinal_hour" transform="rotate(270)" style="fill: #0000"/>
        </g>
        <g>
          <use id="DIALS-l12-o0"  href="#hand" transform="rotate(0)" style="fill: #FFCC44"/>
          <use id="DIALS-l12-o1"  href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l12-o2"  href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l12-o3"  href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l12-o4"  href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l12-o5"  href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l12-o6"  href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l12-o7"  href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l12-o8"  href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l12-o9"  href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l12-o10" href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l12-o11" href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(96, 96)">
        <circle id="FACES-l13-o0" stroke="#000000" style="fill: #113366" r="20"></circle>
        <use href="#background_face_hours"/>
        <g>
          <use id="HOUR_MARKS-l13-o0" href="#cardinal_hour" transform="rotate(0)" style="fill: #CC6600"/>
          <use id="HOUR_MARKS-l13-o1" href="#cardinal_hour" transform="rotate(90)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l13-o2" href="#cardinal_hour" transform="rotate(180)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l13-o3" href="#cardinal_hour" transform="rotate(270)" style="fill: #0000"/>
        </g>
        <g>
          <use id="DIALS-l13-o0"  href="#hand" transform="rotate(0)" style="fill: #FFCC44"/>
          <use id="DIALS-l13-o1"  href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l13-o2"  href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l13-o3"  href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l13-o4"  href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l13-o5"  href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l13-o6"  href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l13-o7"  href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l13-o8"  href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l13-o9"  href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l13-o10" href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l13-o11" href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(156, 96)">
        <circle id="FACES-l14-o0" stroke="#000000" style="fill: #113366" r="20"></circle>
        <use href="#background_face_hours"/>
        <g>
          <use id="HOUR_MARKS-l14-o0" href="#cardinal_hour" transform="rotate(0)" style="fill: #CC6600"/>
          <use id="HOUR_MARKS-l14-o1" href="#cardinal_hour" transform="rotate(90)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l14-o2" href="#cardinal_hour" transform="rotate(180)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l14-o3" href="#cardinal_hour" transform="rotate(270)" style="fill: #0000"/>
        </g>
        <g>
          <use id="DIALS-l14-o0"  href="#hand" transform="rotate(0)" style="fill: #FFCC44"/>
          <use id="DIALS-l14-o1"  href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l14-o2"  href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l14-o3"  href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l14-o4"  href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l14-o5"  href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l14-o6"  href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l14-o7"  href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l14-o8"  href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l14-o9"  href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l14-o10" href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l14-o11" href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(36, 156)">
        <circle id="FACES-l15-o0" stroke="#000000" style="fill: #113366" r="20"></circle>
        <use href="#background_face_hours"/>
        <g>
          <use id="HOUR_MARKS-l15-o0" href="#cardinal_hour" transform="rotate(0)" style="fill: #CC6600"/>
          <use id="HOUR_MARKS-l15-o1" href="#cardinal_hour" transform="rotate(90)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l15-o2" href="#cardinal_hour" transform="rotate(180)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l15-o3" href="#cardinal_hour" transform="rotate(270)" style="fill: #0000"/>
        </g>
        <g>
          <use id="DIALS-l15-o0"  href="#hand" transform="rotate(0)" style="fill: #FFCC44"/>
          <use id="DIALS-l15-o1"  href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l15-o2"  href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l15-o3"  href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l15-o4"  href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l15-o5"  href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l15-o6"  href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l15-o7"  href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l15-o8"  href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l15-o9"  href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l15-o10" href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l15-o11" href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(96, 156)">
        <circle id="FACES-l16-o0" stroke="#000000" style="fill: #113366" r="20"></circle>
        <use href="#background_face_hours"/>
        <g>
          <use id="HOUR_MARKS-l16-o0" href="#cardinal_hour" transform="rotate(0)" style="fill: #CC6600"/>
          <use id="HOUR_MARKS-l16-o1" href="#cardinal_hour" transform="rotate(90)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l16-o2" href="#cardinal_hour" transform="rotate(180)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l16-o3" href="#cardinal_hour" transform="rotate(270)" style="fill: #0000"/>
        </g>
        <g>
          <use id="DIALS-l16-o0"  href="#hand" transform="rotate(0)" style="fill: #FFCC44"/>
          <use id="DIALS-l16-o1"  href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l16-o2"  href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l16-o3"  href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l16-o4"  href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l16-o5"  href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l16-o6"  href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l16-o7"  href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l16-o8"  href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l16-o9"  href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l16-o10" href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l16-o11" href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(156, 156)">
        <circle id="FACES-l17-o0" stroke="#000000" style="fill: #113366" r="20"></circle>
        <use href="#background_face_hours"/>
        <g>
          <use id="HOUR_MARKS-l17-o0" href="#cardinal_hour" transform="rotate(0)" style="fill: #CC6600"/>
          <use id="HOUR_MARKS-l17-o1" href="#cardinal_hour" transform="rotate(90)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l17-o2" href="#cardinal_hour" transform="rotate(180)" style="fill: #0000"/>
          <use id="HOUR_MARKS-l17-o3" href="#cardinal_hour" transform="rotate(270)" style="fill: #0000"/>
        </g>
        <g>
          <use id="DIALS-l17-o0"  href="#hand" transform="rotate(0)" style="fill: #FFCC44"/>
          <use id="DIALS-l17-o1"  href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l17-o2"  href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l17-o3"  href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l17-o4"  href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l17-o5"  href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l17-o6"  href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l17-o7"  href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l17-o8"  href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l17-o9"  href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l17-o10" href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l17-o11" href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
    </g>
  </g>
</svg>`;
