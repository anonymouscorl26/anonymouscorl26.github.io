window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');

    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');

    if (container && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');

    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function () {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';

            setTimeout(function () {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function (err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function () {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function () {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');

    if (carouselVideos.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });

    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

$(document).ready(function () {
    // Check for click events on the navbar burger icon

    var options = {
        slidesToScroll: 1,
        slidesToShow: 1,
        loop: true,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 5000,
    }

    // Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    bulmaSlider.attach();

    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();

})


////////////
// Charts //
////////////

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
        }
    });
});

document.querySelectorAll(".chart-container").forEach(el => {
    observer.observe(el);
});

const liberoBarChart = function (highlightBarsChart, dataset, id, title) {
    const canvas = document.getElementById(id);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    // Plugin to show values on top
    const valueLabelPlugin = {
        id: 'valueLabel',
        afterDatasetsDraw(chart) {
            const { ctx } = chart;

            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);

                meta.data.forEach((bar, index) => {
                    const value = dataset.data[index];
                    if (value !== null && value !== undefined) {
                        const { x, y } = bar.tooltipPosition();

                        ctx.save();
                        ctx.font = '14px sans-serif';
                        ctx.fillStyle = 'black';
                        ctx.textAlign = 'center';
                        ctx.fillText(value + '%', x, y - 10);
                        ctx.restore();
                    }
                });
            });
        }
    };
    const createHighlightPlugin = (highlightBars) => ({
        id: 'highlightPlugin',
        afterDraw: (chart) => {
            const ctx = chart.ctx;
            highlightBars.forEach(({ datasetIndex, dataIndex, color }) => {
                const meta = chart.getDatasetMeta(datasetIndex);
                if (meta.data[dataIndex]) {
                    const bar = meta.data[dataIndex];
                    const time = Date.now() / 1000;
                    const intensity = Math.sin(time * Math.PI) * 0.5 + 0.5;
                    ctx.save();
                    ctx.shadowColor = `rgba(${color}, ${intensity})`;
                    ctx.strokeStyle = `rgba(${color}, ${intensity})`;
                    ctx.shadowBlur = 10;
                    ctx.lineWidth = 5;
                    const barWidth = bar.width;
                    const barHeight = chart.chartArea.bottom - bar.y;
                    ctx.strokeRect(bar.x - barWidth / 2, bar.y, barWidth, barHeight);
                    ctx.restore();
                }
            });
            requestAnimationFrame(() => {
                chart.draw();
            });
        }
    });
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [''],
            datasets: dataset
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    position: 'bottom',
                    color: '#000000',
                    padding: {
                        top: 6,
                        bottom: 0
                    },
                    font: {
                        size: 16,
                        // weight: 'bold',
                        family: 'sans-serif'
                    }
                },
                legend: {
                    display: true,
                    labels: {
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.parsed.y + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: false, // Ensures they sit side-by-side
                },
                y: {
                    beginAtZero: false,
                    min: 75,
                    max: 85,
                    title: {
                        display: true,
                        text: 'Success Rate (%)',
                        font: {
                            weight: 'bold',
                            size: 16
                        }
                    }
                }
            }
        },
        plugins: [createHighlightPlugin(highlightBarsChart),

        // Inject your updated data labels layout
        {
            id: 'valueLabels',
            afterDraw: chart => {
                const ctx = chart.ctx;
                chart.data.datasets.forEach((dataset, i) => {
                    chart.getDatasetMeta(i).data.forEach((bar, index) => {
                        const originalData = dataset.data[index];
                        if (originalData !== null && originalData !== undefined) {
                            const { x, y } = bar.tooltipPosition();
                            ctx.save();
                            ctx.fillStyle = 'black';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'bottom';
                            ctx.font = '14px sans-serif';
                            ctx.fillText(originalData.toFixed(1) + '%', x, y - 5);
                            ctx.restore();
                        }
                    });
                });
            }
        }]
    });
};

document.addEventListener('DOMContentLoaded', liberoBarChart(
    highlightBarsChart = [
        { datasetIndex: 4, dataIndex: 0, color: "6, 118, 255" }
    ],
    dataset = [
        { label: 'LAPA', data: [77.8], backgroundColor: '#f87171' },
        { label: 'D-LAPA Model 1', data: [79.8], backgroundColor: '#fb923c' },
        { label: 'D-LAPA Model 2', data: [83.2], backgroundColor: '#fbbf24' },
        { label: 'D-LAPA Model 3', data: [80.2], backgroundColor: '#4ade80' },
        {
            label: 'D-LAPA Model 4', data: [84.2],
            backgroundColor: "rgba(96, 165, 250, 0.5)",
        },

        { label: 'D-LAPA Model 5', data: [77.4], backgroundColor: '#818cf8' }
    ],
    id = "liberoChart",
    title = "LIBERO-LONG Benchmark Results"
))

const calvinBarChart = function (highlightBarsChart, dataset, id, title) {
    const canvas = document.getElementById(id);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Plugin to dynamically animate highlighting on target bars
    const createHighlightPlugin = (highlightBars) => ({
        id: 'highlightPlugin',
        afterDraw: (chart) => {
            const ctx = chart.ctx;
            highlightBars.forEach(({ datasetIndex, dataIndex, color }) => {
                const meta = chart.getDatasetMeta(datasetIndex);
                if (meta.data[dataIndex]) {
                    const bar = meta.data[dataIndex];
                    const time = Date.now() / 1000;
                    const intensity = Math.sin(time * Math.PI) * 0.5 + 0.5;
                    ctx.save();
                    ctx.shadowColor = `rgba(${color}, ${intensity})`;
                    ctx.strokeStyle = `rgba(${color}, ${intensity})`;
                    ctx.shadowBlur = 10;
                    ctx.lineWidth = 4;
                    const barWidth = bar.width;
                    const barHeight = chart.chartArea.bottom - bar.y;
                    ctx.strokeRect(bar.x - barWidth / 2, bar.y, barWidth, barHeight);
                    ctx.restore();
                }
            });
            requestAnimationFrame(() => {
                chart.draw();
            });
        }
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            // Sequential labels representing successive tasks
            labels: ['1 Task', '2 Tasks', '3 Tasks', '4 Tasks', '5 Tasks'],
            datasets: dataset
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    position: 'bottom',
                    color: '#000000',
                    padding: {
                        top: 6,
                        bottom: 0
                    },
                    font: {
                        size: 16,
                        // weight: 'bold',
                        family: 'sans-serif'
                    }
                },
                legend: {
                    display: true,
                    labels: {
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': ' + context.parsed.y + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: false // Ensures side-by-side grouping per task
                },
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Success Rate (%)',
                        font: {
                            weight: 'bold',
                            size: 16
                        }
                    }
                }
            }
        },
        plugins: [
            createHighlightPlugin(highlightBarsChart),
            {
                id: 'valueLabels',
                afterDraw: chart => {
                    const ctx = chart.ctx;
                    chart.data.datasets.forEach((dataset, i) => {
                        chart.getDatasetMeta(i).data.forEach((bar, index) => {
                            const originalData = dataset.data[index];
                            if (originalData !== null && originalData !== undefined) {
                                const { x, y } = bar.tooltipPosition();
                                ctx.save();
                                ctx.fillStyle = 'black';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'bottom';
                                ctx.font = '11px sans-serif'; // Reduced slightly for dense 5-group display
                                ctx.fillText(originalData.toFixed(1) + '%', x, y - 5);
                                ctx.restore();
                            }
                        });
                    });
                }
            }
        ]
    });
};

// Execution / Initialization 
document.addEventListener('DOMContentLoaded', () => {
    calvinBarChart(
        highlightBarsChart = [
            { datasetIndex: 0, dataIndex: 0, color: "248, 64, 64" },
            { datasetIndex: 1, dataIndex: 1, color: "164, 119, 1" },
            { datasetIndex: 1, dataIndex: 2, color: "164, 119, 1" },
            { datasetIndex: 1, dataIndex: 3, color: "164, 119, 1" },
            { datasetIndex: 1, dataIndex: 4, color: "164, 119, 1" },
        ],
        dataset = [
            {
                label: 'LAPA',
                data: [86.8, 61.2, 44.8, 34.1, 22.2],
                backgroundColor: '#f87171'
            },
            {
                label: 'D-LAPA Model 2',
                data: [84.2, 65.5, 46.0, 34.3, 24.6],
                backgroundColor: '#fbbf24'
            },
            {
                label: 'D-LAPA Model 4',
                data: [84.6, 63.2, 44.9, 34.0, 23.9],
                backgroundColor: "rgba(96, 165, 250, 0.5)"
            }
        ],
        id = "calvinChart",
        title = "CALVIN Long-Horizon Results"
    );
});

const modelData = {
  model1: `
    <h5 class="title is-5">Model 1</h5>

    <p class="is-size-6">
      <strong>Input:</strong> Depth image $D_t$ + RGB latent indices $z_t^{\\mathrm{rgb\\text{-}idx}}$
    </p>

    <p class="is-size-6">
      $$h_t^D = f(D_t, z_t^{\\mathrm{rgb\\text{-}idx}}), \\quad
      \\hat{\\ell}_t^D = g(h_t^D)$$
    </p>

    <p class="is-size-6">
      $$\\mathcal{L} = \\mathrm{CE}(\\hat{\\ell}_t^D, z_t^{\\mathrm{depth\\text{-}idx}})$$
    </p>

    <p class="is-size-6 has-text-grey">
      Predicts discrete depth tokens via classification. Tests whether <em>index-level conditioning</em> is sufficient.
    </p>
  `,

  model2: `
    <h5 class="title is-5">Model 2</h5>

    <p class="is-size-6">
      <strong>Input:</strong> Depth image $D_t$ + RGB feature $z_t^{\\mathrm{rgb\\text{-}feat}}$
    </p>

    <p class="is-size-6">
      $$h_t^D = f(D_t, z_t^{\\mathrm{rgb\\text{-}feat}}), \\quad
      \\hat{\\ell}_t^D = g(h_t^D)$$
    </p>

    <p class="is-size-6">
      $$\\mathcal{L} = \\mathrm{CE}(\\hat{\\ell}_t^D, z_t^{\\mathrm{depth\\text{-}idx}})$$
    </p>

    <p class="is-size-6 has-text-grey">
      Same objective as Model 1 but with continuous conditioning. Tests whether <em>feature-level signals</em> improve depth token prediction.
    </p>
  `,

  model3: `
    <h5 class="title is-5">Model 3</h5>

    <p class="is-size-6">
      <strong>Input:</strong> RGB feature only $z_t^{\\mathrm{rgb\\text{-}feat}}$
    </p>

    <p class="is-size-6">
      $$h_t^D = f(z_t^{\\mathrm{rgb\\text{-}feat}}), \\quad
      \\hat{\\ell}_t^D = g(h_t^D)$$
    </p>

    <p class="is-size-6">
      $$\\mathcal{L} = \\mathrm{CE}(\\hat{\\ell}_t^D, z_t^{\\mathrm{depth\\text{-}idx}})$$
    </p>

    <p class="is-size-6 has-text-grey">
      Removes depth input entirely. Tests whether RGB alone encodes enough information to infer <em>discrete geometry</em>.
    </p>
  `,

  model4: `
    <h5 class="title is-5">Model 4</h5>

    <p class="is-size-6">
      <strong>Input:</strong> Depth image $D_t$ + RGB feature $z_t^{\\mathrm{rgb\\text{-}feat}}$
    </p>

    <p class="is-size-6">
      $$\\hat{z}_t^D = f(D_t, z_t^{\\mathrm{rgb\\text{-}feat}})$$
    </p>

    <p class="is-size-6">
      $$\\mathcal{L} = \\|\\hat{z}_t^D - z_t^{\\mathrm{depth\\text{-}feat}}\\|_2^2
      + \\lambda_{\\cos}(1 - \\cos(\\hat{z}_t^D, z_t^{\\mathrm{depth\\text{-}feat}}))$$
    </p>

    <p class="is-size-6 has-text-grey">
      Directly distills continuous depth features. Main model capturing <em>dense geometric structure</em>.
    </p>
  `,

  model5: `
    <h5 class="title is-5">Model 5</h5>

    <p class="is-size-6">
      <strong>Input:</strong> RGB feature only $z_t^{\\mathrm{rgb\\text{-}feat}}$
    </p>

    <p class="is-size-6">
      $$\\hat{z}_t^D = f(z_t^{\\mathrm{rgb\\text{-}feat}})$$
    </p>

    <p class="is-size-6">
      $$\\mathcal{L} = \\|\\hat{z}_t^D - z_t^{\\mathrm{depth\\text{-}feat}}\\|_2^2
      + \\lambda_{\\cos}(1 - \\cos(\\hat{z}_t^D, z_t^{\\mathrm{depth\\text{-}feat}}))$$
    </p>

    <p class="is-size-6 has-text-grey">
      No depth input. Tests whether RGB can <em>hallucinate continuous geometry</em>.
    </p>
  `
};

let activeModel = null;

const panel = document.getElementById("model-detail-panel");
const content = panel.querySelector(".model-detail-content");

document.querySelectorAll(".model-item").forEach(item => {
    item.addEventListener("click", () => {
        const modelKey = item.dataset.model;

        // Toggle same model
        if (activeModel === modelKey) {
            panel.classList.remove("active");
            activeModel = null;
            return;
        }

        // Update content with animation
        content.classList.remove("fade");
        void content.offsetWidth; // force reflow
        content.innerHTML = modelData[modelKey];
        if (window.MathJax) {
            MathJax.typesetPromise([content]);
        }
        content.classList.add("fade");

        panel.classList.add("active");
        activeModel = modelKey;
    });
});