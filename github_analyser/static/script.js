let pieChart = null;
let barChart = null;

// =========================
// AI Score
// =========================
function calculateScore(data) {

    let score = 0;

    score += Math.min(data.public_repos * 2, 30);
    score += Math.min(data.stars * 1.5, 25);
    score += Math.min(data.followers * 2, 25);

    const languageCount = Object.keys(data.languages).length;
    score += Math.min(languageCount * 5, 20);

    return Math.min(Math.round(score), 100);
}

// =========================
// Badge
// =========================
function getBadge(score){

    if(score >= 80)
        return "🏆 Expert Developer";

    if(score >= 60)
        return "🚀 Intermediate Developer";

    return "🌱 Beginner Developer";
}


// =========================
// Analyze
// =========================
async function analyzeUser(){

    const username = document.getElementById("username").value.trim();

    if(username === ""){
        alert("Please enter a GitHub username");
        return;
    }

    const loading = document.getElementById("loading");
    const error = document.getElementById("error");

    loading.style.display = "block";
    error.innerHTML = "";

    document.getElementById("profileCard").style.display="none";
    document.getElementById("stats").style.display="none";
    document.getElementById("scoreCard").style.display="none";

    try{

        const response = await fetch("/analyze",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                username:username
            })

        });

        const data = await response.json();

        loading.style.display="none";

        if(data.error){

            error.innerHTML=data.error;
            return;

        }

        //-------------------------
        // Profile
        //-------------------------

        document.getElementById("avatar").src=data.avatar;

        document.getElementById("name").innerHTML=data.name;

        document.getElementById("bio").innerHTML=data.bio || "No bio available";

        document.getElementById("company").innerHTML=data.company || "-";

        document.getElementById("location").innerHTML=data.location || "-";

        document.getElementById("profileLink").href=data.profile_url;


        //-------------------------
        // Stats
        //-------------------------

        document.getElementById("followers").innerHTML=data.followers;

        document.getElementById("following").innerHTML=data.following;

        document.getElementById("repos").innerHTML=data.public_repos;

        document.getElementById("stars").innerHTML=data.stars;

        document.getElementById("forks").innerHTML=data.forks;


        //-------------------------
        // Score
        //-------------------------

        const score=calculateScore(data);

        document.getElementById("score").innerHTML=score+"/100";

        document.getElementById("badge").innerHTML=getBadge(score);


        //-------------------------
        // Show Cards
        //-------------------------

        document.getElementById("profileCard").style.display="block";

        document.getElementById("stats").style.display="grid";

        document.getElementById("scoreCard").style.display="block";


        //-------------------------
        // Charts
        //-------------------------

        const labels=Object.keys(data.languages);

        const values=Object.values(data.languages);


        if(pieChart){

            pieChart.destroy();

        }

        pieChart=new Chart(document.getElementById("pieChart"),{

            type:"pie",

            data:{

                labels:labels,

                datasets:[{

                    data:values

                }]

            }

        });


        if(barChart){

            barChart.destroy();

        }

        barChart=new Chart(document.getElementById("barChart"),{

            type:"bar",

            data:{

                labels:labels,

                datasets:[{

                    label:"Repositories",

                    data:values

                }]

            },

            options:{

                responsive:true,

                plugins:{
                    legend:{
                        display:false
                    }
                }

            }

        });


    }

    catch(err){

        loading.style.display="none";

        error.innerHTML="Something went wrong.";

        console.log(err);

    }

}