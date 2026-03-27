import React from "react";

export default function ThemeToggle({ checked, onChange, title }) {
  return (
    <label className="theme-toggle-button" title={title}>
      <input
        type="checkbox"
        className="theme-toggle-input"
        checked={checked}
        onChange={onChange}
      />
      <svg viewBox="0 0 69.667 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g transform="translate(3.5 3.5)">
          <rect
            className="theme-toggle-container"
            fill="#83cbd8"
            rx="17.5"
            height="35"
            width="60.667"
          />

          <g transform="translate(2.333 2.333)" className="theme-toggle-button-knob">
            <g className="theme-toggle-sun">
              <circle fill="#f8e664" r="15.167" cy="15.167" cx="15.167" />
              <path
                fill="rgba(246,254,247,0.29)"
                transform="translate(3.5 3.5)"
                d="M11.667,0A11.667,11.667,0,1,1,0,11.667,11.667,11.667,0,0,1,11.667,0Z"
              />
              <circle fill="#fcf4b9" transform="translate(8.167 8.167)" r="7" cy="7" cx="7" />
            </g>

            <g className="theme-toggle-moon">
              <circle fill="#d9ccff" r="15.167" cy="15.167" cx="15.167" />
              <g fill="#b29ae8" transform="translate(-24.415 -1.009)">
                <circle transform="translate(43.009 4.496)" r="2" cy="2" cx="2" />
                <circle transform="translate(39.366 17.952)" r="2" cy="2" cx="2" />
                <circle transform="translate(33.016 8.044)" r="1" cy="1" cx="1" />
                <circle transform="translate(51.081 18.888)" r="1" cy="1" cx="1" />
                <circle transform="translate(33.016 22.503)" r="1" cy="1" cx="1" />
                <circle transform="translate(50.081 10.53)" r="1.5" cy="1.5" cx="1.5" />
              </g>
            </g>
          </g>

          <path
            className="theme-toggle-cloud"
            fill="#fff"
            transform="translate(20.34 12.875)"
            d="M4.34,0A4.463,4.463,0,0,1,6.583.62a.95.95,0,0,1,.72-1.281A4.852,4.852,0,0,1,9.926-.142c.034.02-.5-1.968.281-2.716a2.117,2.117,0,0,1,2.829-.274,1.821,1.821,0,0,1,.854,1.858c.063.037,2.594-.049,3.285,1.273s-.865,2.544-.807,2.626a12.192,12.192,0,0,1,2.278.892c.553.448,1.106,1.992-1.62,2.927a7.742,7.742,0,0,1-3.762-.3c-1.28-.49-1.181-2.65-1.137-2.624s-1.417,2.2-2.623,2.2A4.172,4.172,0,0,1,7.11,4.514a3.825,3.825,0,0,1-2.771.774C.91,4.828,2.006,2.021,2.139,1.738A3.721,3.721,0,0,1,4.34,0Z"
          />

          <g fill="#def8ff" transform="translate(3.585 1.325)" className="theme-toggle-stars">
            <path transform="matrix(-1, 0.017, -0.017, -1, 24.231, 3.055)" d="M.774,0,.566.559,0,.539.458.933.25,1.492l.485-.361.458.394L1.024.953,1.509.592.943.572Z" />
            <path transform="matrix(-0.777, 0.629, -0.629, -0.777, 23.185, 12.358)" d="M1.341.529.836.472.736,0,.505.46,0,.4.4.729l-.231.46L.605.932l.4.326L.9.786Z" />
            <path transform="matrix(0.438, 0.899, -0.899, 0.438, 23.177, 29.735)" d="M.015,1.065.475.9l.285.365L.766.772l.46-.164L.745.494.751,0,.481.407,0,.293.285.658Z" />
            <path transform="translate(12.677 0.388) rotate(104)" d="M1.161,1.6,1.059,1,1.574.722.962.607.86,0,.613.572,0,.457.446.881.2,1.454l.516-.274Z" />
            <path transform="matrix(-0.07, 0.998, -0.998, -0.07, 11.066, 15.457)" d="M.873,1.648l.114-.62L1.579.945,1.03.62,1.144,0,.706.464.157.139.438.7,0,1.167l.592-.083Z" />
            <path transform="translate(8.326 28.061) rotate(11)" d="M.593,0,.638.724,0,.982l.7.211.045.724.36-.64.7.211L1.342.935,1.7.294,1.063.552Z" />
            <path transform="translate(5.012 5.962) rotate(172)" d="M.816,0,.5.455,0,.311.323.767l-.312.455.516-.215.323.456L.827.911,1.343.7.839.552Z" />
            <path transform="translate(2.218 14.616) rotate(169)" d="M1.261,0,.774.571.114.3.487.967,0,1.538.728,1.32l.372.662.047-.749.728-.218L1.215.749Z" />
          </g>
        </g>
      </svg>
    </label>
  );
}
