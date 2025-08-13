export const LoggedUser = () => {
    const name = localStorage.getItem("name");

    const logoutFunction = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("email");
        localStorage.removeItem("name");
        localStorage.removeItem("picture");
        localStorage.removeItem("user_email");
        window.location.reload();
    };

    return <>Welcome {name} (<a href="#" onClick={logoutFunction}>logout</a>)</>;
}