const options = {

    chart: {
        type: 'area',
        height: 250,
        width: '100%',
        parentHeightOffset: 0,

        toolbar: {
            show: false
        },

        zoom: {
            enabled: false
        },

        background: 'transparent',

        animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 1200
        }
    },

    series: [{
        name: 'Ventas',
        data: [
            200000,
            650000,
            1200000,
            980000,
            1700000,
            1600000,
            2600000
        ]
    }],

    colors: ['#A855F7'],

    stroke: {
        curve: 'smooth',
        width: 4,
        lineCap: 'round'
    },

    dataLabels: {
        enabled: false
    },

    markers: {
        size: 0,

        hover: {
            size: 7,
            sizeOffset: 2
        }
    },

    fill: {
        type: 'gradient',

        gradient: {
            shade: 'dark',
            opacityFrom: 0.35,
            opacityTo: 0,
            stops: [0, 100]
        }
    },

    grid: {
        borderColor: '#23242B',

        strokeDashArray: 0,

        padding: {
            left: 20,
            right: 20,
            top: 15,
            bottom: 5
        }
    },

    xaxis: {

        categories: [
            '1 May',
            '6 May',
            '11 May',
            '16 May',
            '21 May',
            '26 May',
            '31 May'
        ],

        axisBorder: {
            show: false
        },

        axisTicks: {
            show: false
        },

        labels: {
            style: {
                colors: '#8D8F99',
                fontSize: '12px'
            }
        }
    },

    yaxis: {

        min: 0,
        max: 3000000,
        tickAmount: 6,

        labels: {

            style: {
                colors: '#8D8F99',
                fontSize: '12px'
            },

            formatter: function (value) {

                if (value === 0) return "$0";

                return "$" + (value / 1000000) + "M";
            }
        }
    },

    tooltip: {

        theme: 'dark',

        marker: {
            show: false
        },

        x: {
            show: false
        },

        y: {
            formatter: function (value) {
                return "$ " + value.toLocaleString("es-AR");
            }
        }
    },

    legend: {
        show: false
    },

    states: {

        hover: {

            filter: {
                type: 'lighten',
                value: 0.15
            }
        }
    }
};

const chart = new ApexCharts(document.querySelector("#chart"), options);

chart.render();