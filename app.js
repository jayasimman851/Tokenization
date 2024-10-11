const express = require('express');
const natural = require('natural');

const app = express();

// Use middleware to handle form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Tokenizer function using 'natural'
const tokenizer = new natural.WordTokenizer();

// Home route to take user input
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                .container {
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    padding: 20px;
                    width: 400px;
                    text-align: center;
                }
                h1 {
                    color: #3498db;
                    margin-bottom: 20px;
                }
                form {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                input[type="text"] {
                    padding: 10px;
                    border: 2px solid #3498db;
                    border-radius: 5px;
                    font-size: 16px;
                    outline: none;
                }
                button {
                    padding: 10px;
                    background-color: #3498db;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                }
                button:hover {
                    background-color: #2980b9;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Tokenize & Predict</h1>
                <form action="/tokenize" method="post">
                    <label>Enter a sentence:</label>
                    <input type="text" name="sentence" placeholder="Type your sentence here..." required/>
                    <button type="submit">Tokenize, Plot, and Predict</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// Route to handle tokenization and plotting
app.post('/tokenize', (req, res) => {
    const sentence = req.body.sentence;
    const tokens = tokenizer.tokenize(sentence);

    // Print the tokens
    console.log("Tokens: ", tokens);

    // Create data for 3D plot (arrows)
    const x = [];
    const y = [];
    const z = [];
    const u = [];  // Arrow length in x-direction
    const v = [];  // Arrow length in y-direction
    const w = [];  // Arrow length in z-direction

    // Generate random data for each token and prepare arrays for plotting
    tokens.forEach((token, index) => {
        x.push(index); // Token index as 'x'
        y.push(token.length);  // Token length as 'y'
        z.push(Math.random() * 10);  // Random 'z' value

        // Set arrow directions (u, v, w) to simulate arrows
        u.push(0.5);  // Horizontal arrow component (in x-direction)
        v.push(0.5);  // Vertical arrow component (in y-direction)
        w.push(0.5);  // Z-direction arrow component (upwards)
    });

    // Calculate the prediction: Average token length as a simple "prediction"
    const avgTokenLength = tokens.reduce((acc, token) => acc + token.length, 0) / tokens.length;
    const predictedTokenLength = avgTokenLength.toFixed(2); // Limit prediction to 2 decimal places

    // Serve the HTML with embedded plot
    res.send(`
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                    padding: 20px;
                }
                h1 {
                    color: #3498db;
                    text-align: center;
                }
                p {
                    font-size: 18px;
                    text-align: center;
                }
                #plot {
                    margin-top: 30px;
                    height: 500px;
                }
            </style>
        </head>
        <body>
            <h1>3D Token Plot with Arrows</h1>
            <p><strong>Tokens:</strong> ${tokens.join(', ')}</p>
            <p><strong>Prediction:</strong> The predicted next token length is: ${predictedTokenLength} characters</p>
            <div id="plot"></div>

            <!-- Plotly.js from CDN -->
            <script src="https://cdn.plot.ly/plotly-2.35.2.min.js" charset="utf-8"></script>
            <script>
                // Plot arrows by connecting points with lines
                const trace = {
                    x: [].concat(...${JSON.stringify(x)}.map((x, i) => [x, x + ${JSON.stringify(u)}[i]])),
                    y: [].concat(...${JSON.stringify(y)}.map((y, i) => [y, y + ${JSON.stringify(v)}[i]])),
                    z: [].concat(...${JSON.stringify(z)}.map((z, i) => [z, z + ${JSON.stringify(w)}[i]])),
                    mode: 'lines+text',
                    type: 'scatter3d',
                    text: ${JSON.stringify(tokens)},  // Labels for each token
                    textposition: 'top center',
                    line: {
                        width: 6,
                        color: 'blue'
                    }
                };

                const layout = {
                    title: '3D Token Plot with Arrows',
                    scene: {
                        xaxis: { title: 'Token Index' },
                        yaxis: { title: 'Token Length' },
                        zaxis: { title: 'Random Z' }
                    }
                };

                const data = [trace];
                Plotly.newPlot('plot', data, layout);
            </script>
        </body>
        </html>
    `);
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
