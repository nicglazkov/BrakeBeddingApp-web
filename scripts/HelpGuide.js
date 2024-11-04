class HelpGuide {
    static content = {
        introduction: {
            title: "What is Brake Bedding?",
            content: `Brake bedding is the process of properly breaking in new brake pads and/or rotors. 
                     This process deposits an even layer of brake pad material onto the rotor surface and 
                     gradually heats the brakes to properly cure the pad material.`
        },
        safety: {
            title: "Safety Guidelines",
            content: `• Only perform brake bedding on empty, safe roads
                     • Follow all traffic laws and speed limits
                     • Maintain awareness of your surroundings
                     • Stop if you smell burning or feel brake fade
                     • Allow full cool-down before parking`
        },
        procedure: {
            title: "Using the App",
            content: `1. Configure your stages in Settings
                     2. Find a safe, empty road
                     3. Start the procedure
                     4. Follow the color-coded instructions:
                        - Green: Accelerate
                        - Blue: Hold Speed
                        - Red: Apply Brakes
                        - Yellow: Cooling Period
                     5. Complete all cycles in each stage
                     6. Follow the cooldown procedure`
        }
    };

    static show() {
        const modal = document.createElement('div');
        modal.className = 'modal fade-in';
        
        modal.innerHTML = `
            <div class="modal-content slide-in">
                <div class="modal-header">
                    <h2>Brake Bedding Guide</h2>
                    <button class="close-button" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    ${Object.values(this.content).map(section => `
                        <section class="help-section">
                            <h3>${section.title}</h3>
                            <p>${section.content}</p>
                        </section>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }
}