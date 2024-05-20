$(document).ready(function () {

    // Plugin Country Code
    const input = document.querySelector("#phoneNumber");
    const iti = window.intlTelInput(input, {
        initialCountry: "in", // Automatically select the user's country based on their IP address
        separateDialCode: true, // Display the country dial code separately
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@22.0.2/build/js/utils.js",
    });
    // this is form validation
    $(this).validate({
            rules: {
                user_code: {
                    required: true,
                    minlength: 3, 
                    maxlength: 8  
                },
                first_name: {
                    required: true
                },
                middle_name: {
                    required: true
                },
                last_name: {
                    required: true
                },
                phone_number: {
                    required: true,
                    minlength: 10,
                },
                email: {
                    required: true,
                    email: true
                }
            },
            messages: {
                user_code: {
                    required: "Please enter User Code",
                    minlength: "User Code must be at least 3 characters long",
                    maxlength: "User Code must be less than 6 characters long"
                },
                first_name: {
                    required: "Please enter your First Name"
                },
                middle_name: {
                    required: "Please enter  your Middle Name"
                },
                last_name: {
                    required: "Please enter your Last Name"
                },
                phone_number: {
                    required: "Please enter your Phone Number",
                    digits: "Please enter only digits",
                    minlength: "Phone Number must be 10 digits",
                },
                email: {
                    required: "Please enter Email",
                    email: "Please enter a valid Email "
                }
            },
            submitHandler: function (form) {
                if (formId === 'insertForm') {
                    console.log("Insert form submitted");
                    handleInsertFormSubmission(form);
                } else {
                    console.log("Update form submitted");
                    handleUpdateFormSubmission(form);
                }
            }
        });

    // Function to fetch data from API and populate the table
    function fetchDataAndPopulateTable() {
        $.ajax({
            url: 'https://glexas.com/hostel_data/API/raj/new_admission_list.php',
            method: 'POST',
            data: { sort_by: 'id' }, // Sort data by ID
            success: function (response) {
                console.log(response); // Log the response to inspect its structure

                // Check if response status is true and response contains data
                if (response.status && response.status === true && Array.isArray(response.response)) {
                    // Clear existing table rows
                    $('#data-body').empty();

                    // Populate table rows
                    response.response.forEach(function (data) {
                        // Parse the created_time string into a Date object
                        var createdTime = new Date(data.created_time);

                        // Get the current time
                        var currentTime = new Date();

                        // Calculate the time difference in milliseconds
                        var timeDifference = currentTime - createdTime;

                        // Calculate the difference in hours
                        var hoursDifference = Math.abs(timeDifference / (1000 * 60 * 60));

                        // Append table row with buttons only if time difference is less than or equal to 24 hours
                        if (hoursDifference <= 24) {
                            $('#data-body').append(`
                                <tr>
                                    <td>${data.registration_main_id}</td>
                                    <td>${data.user_code}</td>
                                    <td>${data.first_name}</td>
                                    <td>${data.middle_name}</td>
                                    <td>${data.last_name}</td>
                                    <td>${data.phone_country_code}</td>
                                    <td>${data.phone_number}</td>
                                    <td>${data.email}</td>
                                    <td>
                                        <button id="update-btn" class="btn btn-primary" data-id="${data.registration_main_id}">Update</button>
                                        <button class="delete-btn btn btn-danger" data-id="${data.registration_main_id}">Delete</button>
                                    </td>
                                </tr>
                            `);
                        } else {
                            // If time difference is more than 24 hours, hide update and delete buttons
                            $('#data-body').append(`
                                <tr>
                                    <td>${data.registration_main_id}</td>
                                    <td>${data.user_code}</td>
                                    <td>${data.first_name}</td>
                                    <td>${data.middle_name}</td>
                                    <td>${data.last_name}</td>
                                    <td>${data.phone_country_code}</td>
                                    <td>${data.phone_number}</td>
                                    <td>${data.email}</td>
                                    <td>
                                        <button class="btn btn-primary" disabled>Update</button>
                                        <button class="btn btn-danger" disabled>Delete</button>
                                    </td>
                                </tr>
                            `);
                        }
                    });

                    // Show the table container
                    $('.container').show();

                    // Initialize DataTable
                    $('#example').DataTable();
                } else {
                    console.error('Invalid response format or no data found:', response);
                }
            },
            error: function (xhr, status, error) {
                console.error('Error fetching data:', error);
            }
        });
    }

    // Call the function to fetch data and populate the table
    fetchDataAndPopulateTable();

    // delete btn
    $(document).on('click', '.delete-btn', function () {
        var table = $('#example').DataTable();
        var registration_main_id = $(this).data('id');

        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                // Iterate through each row in the DataTable
                const data = table.rows().every(function () {
                    var rowData = this.data();
                    if (rowData && rowData.length > 0) {
                        if (String(rowData[0]) === String(registration_main_id)) {
                            // Remove the row from the DataTable
                            this.remove();
                            return false; // Exit the loop
                        }
                    }
                });
                // Redraw the DataTable
                table.draw(false);

                // Send AJAX request to delete the record from the server
                $.ajax({
                    url: 'https://glexas.com/hostel_data/API/raj/new_admission_delete.php',
                    method: 'POST',
                    data: { registration_main_id: registration_main_id },
                    success: function (response) {
                        // Show success message
                        swal("Success!", response.message, "success");
                    },
                    error: function (xhr, status, error) {
                        // Handle errors
                        console.error('Error deleting record:', error);
                    }
                });
            } else {
                // Show message if the user cancels the delete operation
                swal("The record is safe!");
            }
        });
    });

    // Click event for insert button
    $('#insertButton').click(function () {
        $("#insertModalLabel").text("Insert Record");
        $('#registrationMainId').closest('.form-group').hide();
        $("#Click").text("Insert");
        $('form').attr('id', 'insertForm').removeClass('form');
        var modal = $('#insertModal');
        modal.modal('toggle');
    });

    // Close modal
    $(document).on('click', '.modal .close', function () {
        $(this).closest('.modal').modal('hide');
        $('form').addClass('form');
    });

    // Click event for Update button
    $(document).on('click', '#update-btn', function () {
        $("#insertModalLabel").text("Update Record");
        $("#Click").text("Update");
        $('#registrationMainId').closest('.form-group').show();
        $('form').attr('id', 'updateForm').removeClass('form');
        var modal = $('#insertModal');
        modal.modal('toggle');

        var registration_main_id = $(this).data('id');

        // Fetch all data
        $.ajax({
            url: 'https://glexas.com/hostel_data/API/raj/new_admission_list.php',
            method: 'POST',
            success: function (response) {
                if (response && response.status && response.status === true && Array.isArray(response.response)) {
                    var allData = response.response;

                    // Find the record with the specified registration_main_id
                    var data = allData.find(function (record) {
                        return String(record.registration_main_id) === String(registration_main_id);
                    });

                    if (data) {
                        console.log(data);
                        // Populate the modal with the fetched data
                        $('#registrationMainId').val(data.registration_main_id);
                        $('#userCode').val(data.user_code);
                        $('#firstName').val(data.first_name);
                        $('#middleName').val(data.middle_name);
                        $('#lastName').val(data.last_name);
                        $('#phoneNumber').val(data.phone_number);
                        $('#email').val(data.email);

                        // Show the modal for updating data
                        $('#updateModal').modal('show');
                    } else {
                        swal("Error!", "Record with the provided ID not found.", "error");
                    }
                } else {
                    swal("Error!", "Failed to fetch data for update. Please try again later.", "error");
                }
            },
            error: function (xhr, status, error) {
                console.error('Error fetching data for update:', error);
                swal("Error!", "Failed to fetch data for update. Please try again later.", "error");
            }
        });
    });

    // Close the modal when it is hidden
    $('#insertModal').on('hidden.bs.modal', function () {
        // Clear the form fields when the modal is closed
        $(this).find('form')[0].reset();
    });

    // Function to handle form submission for inserting data
    function handleInsertFormSubmission(form) {
        // Retrieve the unformatted phone number
        const fullPhoneNumber = iti.getNumber(); // Get the phone number with country code
        const selectedCountryData = iti.getSelectedCountryData();
        const countryCode = selectedCountryData.dialCode;
        const phoneNumberWithoutCountryCode = fullPhoneNumber.replace(`+${countryCode}`, '');

        // Serialize form data
        var formData = $(form).serialize();

        // Append country code and formatted phone number to form data
        formData += `&phone_country_code=${countryCode}&phone_number=${phoneNumberWithoutCountryCode}`;

        // Send AJAX request to insert the data
        $.ajax({
            url: 'https://glexas.com/hostel_data/API/raj/new_admission_insert.php',
            method: 'POST',
            data: formData,
            success: function (response) {
                if (response.status && response.status === true) {
                    // Data insertion successful, close the modal
                    $('#insertModal').modal('hide');
                    swal("Success!", response.message, "success");
                    fetchDataAndPopulateTable(); // Refresh the table data
                } else {
                    swal("Error!", response.message, "error");
                }
            },
            error: function (xhr, status, error) {
                console.error('Error inserting data:', error);
                swal("Error!", "Failed to insert data. Please try again later.", "error");
            }
        });
    }

    // Function to handle form submission for updating data
    function handleUpdateFormSubmission(form) {
        // Retrieve the unformatted phone number
        const fullPhoneNumber = iti.getNumber(); // Get the phone number with country code
        const selectedCountryData = iti.getSelectedCountryData();
        const countryCode = selectedCountryData.dialCode;
        const phoneNumberWithoutCountryCode = fullPhoneNumber.replace(`+${countryCode}`, '');

        // Serialize form data
        var formData = $(form).serialize();

        // Append country code and formatted phone number to form data
        formData += `&phone_country_code=${countryCode}&phone_number=${phoneNumberWithoutCountryCode}`;

        // Send AJAX request to update the data
        $.ajax({
            url: 'https://glexas.com/hostel_data/API/raj/new_admission_update.php',
            method: 'POST',
            data: formData,
            success: function (response) {
                if (response.status && response.status === true) {
                    // Data update successful, close the modal
                    $('#insertModal').modal('hide');
                    swal("Success!", response.message, "success");
                    fetchDataAndPopulateTable(); // Refresh the table data
                } else {
                    swal("Error!", response.message, "error");
                }
            },
            error: function (xhr, status, error) {
                console.error('Error updating data:', error);
                swal("Error!", "Failed to update data. Please try again later.", "error");
            }
        });
    }

    // Handle form submission for inserting data
    $(document).on('submit', '#insertForm', function (event) {
        event.preventDefault();
        handleInsertFormSubmission(this);
    });

    // Handle form submission for updating data
    $(document).on('submit', '#updateForm', function (event) {
        event.preventDefault();
        handleUpdateFormSubmission(this);
    });
});