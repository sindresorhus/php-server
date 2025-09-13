<?php
http_response_code(500);
// This will trigger a fatal error (undefined function)
undefined_function();
echo "This should never be reached";
?>