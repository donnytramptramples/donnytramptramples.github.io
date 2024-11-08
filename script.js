document.addEventListener('DOMContentLoaded', () => {
    const headerText = document.querySelector('header h1');
    const subText = document.querySelector('header p');
    const buttons = document.querySelectorAll('.button');

    // Animate header and subheader text
    headerText.style.opacity = 0;
    subText.style.opacity = 0;
    headerText.style.transform = 'translateY(-20px)';
    subText.style.transform = 'translateY(-20px)';

    setTimeout(() => {
        headerText.style.transition = 'opacity 1s ease, transform 1s ease';
        headerText.style.opacity = 1;
        headerText.style.transform = 'translateY(0)';
    }, 500);

    setTimeout(() => {
        subText.style.transition = 'opacity 1s ease, transform 1s ease';
        subText.style.opacity = 1;
        subText.style.transform = 'translateY(0)';
    }, 1000);

    // Bounce effect on button hover
    buttons.forEach(button => {
        button.addEventListener('mouseover', () => {
            button.style.transform = 'scale(1.1) translateY(-5px)';
        });

        button.addEventListener('mouseout', () => {
            button.style.transform = 'scale(1) translateY(0)';
        });
    });
});
