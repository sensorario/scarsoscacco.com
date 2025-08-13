import { useEffect } from "react";
import { useAccessToken } from "./useAccessToken";

const LoggedUser = () => {
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

export default function GoogleLogin() {
    const at = useAccessToken();

    useEffect(() => {
        const url = new URL(window.location.href);
        const access_token = url.searchParams.get("access_token") || "";
        const email = url.searchParams.get("email") || "";
        const user_email = url.searchParams.get("user_email") || "";
        const name = url.searchParams.get("name") || "";
        const picture = url.searchParams.get("picture") || "";

        if (access_token) {
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("email", email);
            localStorage.setItem("name", name);
            localStorage.setItem("picture", picture);
            localStorage.setItem("user_email", user_email);

            // Pulisce l’URL rimuovendo il parametro
            url.searchParams.delete("fooo");
            window.history.replaceState({}, document.title, url.pathname);
        }

    }, []);

    const socialLogin = () => {
        // @todo move client_id, state and so on... in a configuration file
        const redirect_uri =
            "https%3A%2F%2Fsimonegentili.com%2Fapi%2Fchess%2Foauth%2Fcallback";
        document.location.href =
            "https://accounts.google.com/o/oauth2/v2/auth" +
            "?client_id=15368719510-up1i58aamuvdvu1u49lerh8lamrrapfj.apps.googleusercontent.com" +
            "&redirect_uri=" +
            redirect_uri +
            "&response_type=code" +
            "&scope=email%20profile" +
            "&access_type=offline" +
            "&prompt=consent" +
            "&state=scarsoscacco.com";
    };

    return (
        <div>
            {!at ? <button onClick={socialLogin}>Google social login</button> : <LoggedUser />}
        </div>
    );
}
