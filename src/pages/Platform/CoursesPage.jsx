import React from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import Coursehero from '../../components/Platform/Courses/Coursehero';
import Coursecreation from '../../components/Platform/Courses/Coursecreation';
import Coursepay from '../../components/Platform/Courses/Coursepay';
import Athenaplus from '../../components/Platform/Courses/athenaplus';
import CourseFinger from '../../components/Platform/Courses/CourseFinger';
import Courseready from '../../components/Platform/Courses/Courseready';
import Coursecta from '../../components/Platform/Courses/Coursecta';
const CoursesPage = () => {
  return (
    <div>
      <Navbar />
      <Coursehero />
      <Coursecreation />
      <Coursepay />
      <Athenaplus />
      <CourseFinger />
      <Courseready />
      <Coursecta />
      {/* Add more course-related components here */}
      <Footer />
    </div>
  );
};

export default CoursesPage;
