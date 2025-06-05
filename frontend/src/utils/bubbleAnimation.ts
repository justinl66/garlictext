export const bubbleColors = [
    { start: 'rgb(241, 223, 217)', end: 'rgb(244, 192, 216)' },
    { start: 'rgb(244, 192, 216)', end: 'rgb(201, 176, 223)' },
    { start: 'rgb(201, 176, 223)', end: 'rgb(183, 103, 212)' },
    { start: 'rgb(183, 103, 212)', end: 'rgb(132, 173, 194)' },
    { start: 'rgb(132, 173, 194)', end: 'rgb(200, 88, 158)' },
    { start: 'rgb(200, 88, 158)', end: 'rgb(241, 223, 217)' },
];

export const bubbleConfig = {
    size: { min: 20, max: 80 },
    duration: { min: 10, max: 25, speedFactor: 0.9 },
    transition: { duration: '3s', timing: 'ease-in-out', interval: 4000 },
    initialCount: 7,
    spawnInterval: 500
};

export function createBubble() {
    const bubble = document.createElement("div");
    bubble.classList.add("bubble");

    // Random size
    const size = Math.random() * (bubbleConfig.size.max - bubbleConfig.size.min) + bubbleConfig.size.min;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;

    // Random position
    const startPosition = Math.random() * 100;
    bubble.style.left = `${startPosition}%`;

    // Animation duration
    const duration = (Math.random() * (bubbleConfig.duration.max - bubbleConfig.duration.min) + bubbleConfig.duration.min) * bubbleConfig.duration.speedFactor;
    bubble.style.setProperty("--random-offset", Math.random() * 360 + "deg");
    bubble.style.animation = `float ${duration}s linear infinite`;

    // Initial color
    const initialColor = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
    bubble.style.backgroundColor = initialColor.start;
    bubble.style.transition = `background-color ${bubbleConfig.transition.duration} ${bubbleConfig.transition.timing}`;

    // Color change interval
    const colorInterval = setInterval(() => {
        const newColor = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
        bubble.style.backgroundColor = newColor.end;
    }, bubbleConfig.transition.interval);

    // Add to container
    const container = document.getElementById("bubble-container");
    if (container) {
        container.appendChild(bubble);
    }

    // Cleanup
    setTimeout(() => {
        clearInterval(colorInterval);
        bubble.remove();
    }, duration * 1000);

    return bubble;
}

export function startBubbleAnimation() {
    // Create initial bubbles
    for (let i = 0; i < bubbleConfig.initialCount; i++) {
        createBubble();
    }
    // Continue creating bubbles
    const interval = setInterval(createBubble, bubbleConfig.spawnInterval);
    return () => clearInterval(interval);
} 