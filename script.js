if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}
window.addEventListener("DOMContentLoaded", () => {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant"
    });
});document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("active");
            menuToggle.classList.toggle("active", isOpen);
            menuToggle.setAttribute("aria-expanded", isOpen);
        });
        document.querySelectorAll(".nav-links a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
                menuToggle.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
            });
        });
    }
    const revealElements = document.querySelectorAll(".reveal");
    if (
        revealElements.length &&
        "IntersectionObserver" in window
    ) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("active");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12
            }
        );
        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach(element => {
            element.classList.add("active");
        });
    }
    const sections = document.querySelectorAll("section[id]");
    const navigationLinks = document.querySelectorAll(
        '.nav-links a[href^="#"]'
    );
    function updateActiveNav() {
        let currentSection = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 160;
            const sectionBottom =
                sectionTop + section.offsetHeight;
            if (
                window.scrollY >= sectionTop &&
                window.scrollY < sectionBottom
            ) {
                currentSection = section.id;
            }
        });
        navigationLinks.forEach(link => {
            link.classList.toggle(
                "active",
                link.getAttribute("href") === `#${currentSection}`
            );
        });
    }
    window.addEventListener(
        "scroll",
        updateActiveNav,
        { passive: true }
    );
    updateActiveNav();
    const backToTop = document.getElementById("backTop");
    if (backToTop) {
        window.addEventListener(
            "scroll",
            () => {
                backToTop.classList.toggle(
                    "show",
                    window.scrollY > 500
                );
            },
            { passive: true }
        );
        backToTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
    const chatMessages =
        document.getElementById("chatMessages");
    const chatInput =
        document.getElementById("chatInput");
    const sendMessage =
        document.getElementById("sendMessage");
    const resetChat =
        document.getElementById("resetChat");
    let userData = {
        name: "",
        age: "",
        location: "",
        email: "",
        concern: ""
    };
    let chatStep = "name";
    let conversationFinished = false;
    function addMessage(text, sender) {
        if (!chatMessages) {
            return;
        }
        const message = document.createElement("div");
        message.classList.add(
            "chat-message",
            sender === "lara"
                ? "lara-message"
                : "user-message"
        );
        const content = document.createElement("div");
        content.classList.add("message-content");
        content.innerHTML = text;
        message.appendChild(content);
        chatMessages.appendChild(message);
        chatMessages.scrollTop =
            chatMessages.scrollHeight;
    }
    function addTyping() {
        if (!chatMessages) {
            return;
        }
        removeTyping();
        const typing = document.createElement("div");
        typing.id = "typingIndicator";
        typing.classList.add(
            "chat-message",
            "lara-message"
        );
        typing.innerHTML = `
            <div class="message-content typing">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        chatMessages.appendChild(typing);
        chatMessages.scrollTop =
            chatMessages.scrollHeight;
    }
    function removeTyping() {
        const typing =
            document.getElementById("typingIndicator");
        if (typing) {
            typing.remove();
        }
    }
    function setChatEnabled(enabled) {
        if (chatInput) {
            chatInput.disabled = !enabled;
        }
        if (sendMessage) {
            sendMessage.disabled = !enabled;
        }
    }
    function escapeHTML(value) {
        const div = document.createElement("div");
        div.textContent = String(value);
        return div.innerHTML;
    }
    function askNextQuestion() {
        addTyping();
        setTimeout(() => {
            removeTyping();
            let question = "";
            if (chatStep === "name") {
                question =
                    "Hey, I'm LARA. ✦ I'm here to listen. What's your name?";
            } else if (chatStep === "age") {
                question =
                    `Nice to meet you, ${escapeHTML(userData.name)}. How old are you?`;
            } else if (chatStep === "location") {
                question =
                    "Thanks. And which place are you from?";
            } else if (chatStep === "email") {
                question =
                    "Got it. Could you share your email address so I can reply to you or send you an answer later?";
            } else if (chatStep === "concern") {
                question =
                    "Thank you. Now, tell me what’s concerning you or what you’d like help with.";
            }
            if (question) {
                addMessage(question, "lara");
            }
        }, 700);
    }
    function isValidEmail(email) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            .test(email);
    }
    async function sendConversationEmail() {
        try {
            const response = await fetch(
                "https://lara-backend-pigl.onrender.com/api/send-email",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: userData.name,
                        age: userData.age,
                        location: userData.location,
                        email: userData.email,
                        concern: userData.concern
                    })
                }
            );
            const result = await response.json();
            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Failed to send email"
                );
            }
            return true;
        } catch (error) {
            console.error("Email error:", error);
            return false;
        }
    }
    function getConcernResponse(text) {
        const concern = text.toLowerCase();
        if (
            concern.includes("sad") ||
            concern.includes("depressed") ||
            concern.includes("upset") ||
            concern.includes("lonely") ||
            concern.includes("cry") ||
            concern.includes("hurt") ||
            concern.includes("stress") ||
            concern.includes("stressed") ||
            concern.includes("anxious") ||
            concern.includes("anxiety")
        ) {
            return `
                I hear you, ${escapeHTML(userData.name)}. ✦
                Thank you for trusting me enough to share this.
            `;
        }
        if (
            concern.includes("college") ||
            concern.includes("study") ||
            concern.includes("exam") ||
            concern.includes("career") ||
            concern.includes("job") ||
            concern.includes("future")
        ) {
            return `
                I understand, ${escapeHTML(userData.name)}. ✦
                It sounds like this has been weighing on you.
            `;
        }
        if (
            concern.includes("family") ||
            concern.includes("friend") ||
            concern.includes("relationship") ||
            concern.includes("parents")
        ) {
            return `
                I understand, ${escapeHTML(userData.name)}. ✦
                Sometimes situations with people close to us can be difficult to carry alone.
            `;
        }
        return `
            I understand, ${escapeHTML(userData.name)}. ✦
            Thank you for taking the time to tell me about this.
        `;
    }
    function finishConversation() {
        setTimeout(async () => {
            const emailSent =
                await sendConversationEmail();
            removeTyping();
            if (emailSent) {
                addMessage(
                    `Thank you for sharing that with me, ${escapeHTML(userData.name)}. ✦ I've received your concern and I'll get back to you at <strong>${escapeHTML(userData.email)}</strong> with a response.`,
                    "lara"
                );
            } else {
                addMessage(
                    `Thank you for sharing that with me, ${escapeHTML(userData.name)}. ✦ I've received your concern. I'll get back to you at <strong>${escapeHTML(userData.email)}</strong> with a response.`,
                    "lara"
                );
            }
            chatStep = "finished";
            conversationFinished = true;
            setChatEnabled(false);
            if (chatInput) {
                chatInput.placeholder =
                    "Conversation complete";
            }
        }, 900);
    }
    function handleMessage() {
        if (!chatInput || conversationFinished) {
            return;
        }
        const text = chatInput.value.trim();
        if (!text) {
            return;
        }
        addMessage(
            escapeHTML(text),
            "user"
        );
        chatInput.value = "";
        if (chatStep === "name") {
            if (text.length < 2) {
                addTyping();
                setTimeout(() => {
                    removeTyping();
                    addMessage(
                        "I'd love to know your name. Could you tell me what I should call you? ✦",
                        "lara"
                    );
                }, 500);
                return;
            }
            userData.name = text;
            chatStep = "age";
            askNextQuestion();
            return;
        }
        if (chatStep === "age") {
            const age = parseInt(text, 10);
            if (
                Number.isNaN(age) ||
                age < 1 ||
                age > 120
            ) {
                addTyping();
                setTimeout(() => {
                    removeTyping();
                    addMessage(
                        "Could you enter your age so I can continue? ✦",
                        "lara"
                    );
                }, 500);
                return;
            }
            userData.age = age;
            chatStep = "location";
            askNextQuestion();
            return;
        }
        if (chatStep === "location") {
            if (text.length < 2) {
                addTyping();
                setTimeout(() => {
                    removeTyping();
                    addMessage(
                        "Could you tell me which place you're from? ✦",
                        "lara"
                    );
                }, 500);
                return;
            }
            userData.location = text;
            chatStep = "email";
            askNextQuestion();
            return;
        }
        if (chatStep === "email") {
            if (!isValidEmail(text)) {
                addTyping();
                setTimeout(() => {
                    removeTyping();
                    addMessage(
                        "That doesn't look like a valid email address. Could you enter it again? ✦",
                        "lara"
                    );
                }, 500);
                return;
            }
            userData.email = text;
            chatStep = "concern";
            askNextQuestion();
            return;
        }
        if (chatStep === "concern") {
            if (text.length < 2) {
                addTyping();
                setTimeout(() => {
                    removeTyping();
                    addMessage(
                        "Take your time. Tell me a little about what's concerning you. ✦",
                        "lara"
                    );
                }, 500);
                return;
            }
            userData.concern = text;
            addTyping();
            setTimeout(() => {
                removeTyping();
                addMessage(
                    getConcernResponse(text),
                    "lara"
                );
                finishConversation();
            }, 1000);
        }
    }
    if (sendMessage) {
        sendMessage.addEventListener(
            "click",
            handleMessage
        );
    }
    if (chatInput) {
        chatInput.addEventListener(
            "keydown",
            event => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    handleMessage();
                }
            }
        );
    }
    function resetConversation() {
        userData = {
            name: "",
            age: "",
            location: "",
            email: "",
            concern: ""
        };
        chatStep = "name";
        conversationFinished = false;
        if (chatMessages) {
            chatMessages.innerHTML = "";
        }
        if (chatInput) {
            chatInput.value = "";
            chatInput.placeholder =
                "Type your answer...";
        }
        setChatEnabled(true);
        askNextQuestion();
    }
    if (resetChat) {
        resetChat.addEventListener(
            "click",
            resetConversation
        );
    }
    resetConversation();
    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );
    if (reducedMotion.matches) {
        document.documentElement.classList.add(
            "reduce-motion"
        );
    }
    document.querySelectorAll("img").forEach(img => {
        img.addEventListener("error", () => {
            img.classList.add("image-error");
        });
    });
    document.addEventListener(
        "keydown",
        event => {
            if (event.key === "Escape") {
                if (navLinks) {
                    navLinks.classList.remove("active");
                }
                if (menuToggle) {
                    menuToggle.classList.remove("active");
                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            }
        }
    );
});
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const cursorShadow = document.querySelector(".cursor-shadow");
if (
    cursorDot &&
    cursorRing &&
    cursorShadow &&
    window.matchMedia("(pointer: fine)").matches
) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let shadowX = mouseX;
    let shadowY = mouseY;
    document.addEventListener("mousemove", (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });
    function animateCursor() {
        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
        shadowX += (mouseX - shadowX) * 0.08;
        shadowY += (mouseY - shadowY) * 0.08;
        cursorShadow.style.left = `${shadowX}px`;
        cursorShadow.style.top = `${shadowY}px`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    const cursorTargets = document.querySelectorAll(
        "a, button, input, textarea, select, " +
        ".power-card, .gallery-item, .step"
    );
    cursorTargets.forEach((element) => {
        element.addEventListener("mouseenter", () => {
            document.body.classList.add("cursor-hover");
        });
        element.addEventListener("mouseleave", () => {
            document.body.classList.remove("cursor-hover");
        });
    });
    document.addEventListener("mousedown", () => {
        document.body.classList.add("cursor-click");
    });
    document.addEventListener("mouseup", () => {
        document.body.classList.remove("cursor-click");
    });

}