import React from 'react';
import Navbar from '../components/navbar.jsx';
import Footer from '../components/Footer.jsx';
import ExpertHero from '../components/solutions/expert_athena/expert_hero.jsx';
import ExpertChoose from '../components/solutions/expert_athena/expert_choose.jsx';
import ExpertAnswers from '../components/solutions/expert_athena/expert_answer.jsx';
import Expertfeatures from '../components/solutions/expert_athena/expert_feature.jsx';
// import ExpertEnterprise from '../components/solutions/expert_athena/expert_enterprise.jsx';
import ExpertCase from '../components/solutions/expert_athena/expert_case.jsx';
import ExpertScale from '../components/solutions/expert_athena/expert_scale.jsx';
export const ExpertAthena = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <ExpertHero />
            <ExpertChoose />
            <ExpertAnswers />
             <Expertfeatures />
             <ExpertCase />
             <ExpertScale />
             {/*  
            <ExpertEnterprise />
           
             */}
            <Footer />
        </div>
    );
};
export default ExpertAthena;