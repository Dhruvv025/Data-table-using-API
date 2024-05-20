//Same API for all
$(document).ready(function () {
    // Initialize Phone Number Input with intlTelInput
    const input = document.querySelector("#phoneNumber");
    const iti = window.intlTelInput(input, {
        initialCountry: "in",
        separateDialCode: true,
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@22.0.2/build/js/utils.js",
    });

    // Form validation
    $('form').each(function () {
        $(this).validate({
            rules: {
                user_code: {
                    required: true,
                    minlength: 3,
                    maxlength: 8,
                },
                first_name: {
                    required: true,
                },
                middle_name: {
                    required: true,
                },
                last_name: {
                    required: true,
                },
                phone_number: {
                    required: true,
                    minlength: 10,
                },
                email: {
                    required: true,
                    email: true,
                },
            },
            messages: {
                user_code: {
                    required: "Please enter User Code",
                    minlength: "User Code must be at least 3 characters long",
                    maxlength: "User Code must be less than 8 characters long",
                },
                first_name: {
                    required: "Please enter your First Name",
                },
                middle_name: {
                    required: "Please enter your Middle Name",
                },
                last_name: {
                    required: "Please enter your Last Name",
                },
                phone_number: {
                    required: "Please enter your Phone Number",
                    minlength: "Phone Number must be 10 digits",
                },
                email: {
                    required: "Please enter Email",
                    email: "Please enter a valid Email",
                },
            },
            submitHandler: function (form) {
                if (form.id === 'insertForm') {
                    handleFormSubmission(form, 'POST');
                } else if (form.id === 'updateForm') {
                    handleFormSubmission(form, 'PUT');
                }
            },
        });
    });

    // Function to fetch data from API and populate the table
    function fetchDataAndPopulateTable() {
        $.ajax({
            url: 'https://glexas.com/hostel_data/API/raj/new_admission_crud.php',
            method: 'GET',
            success: function (response) {
                if (response.status && response.status === true && Array.isArray(response.response)) {
                    $('#data-body').empty();

                    response.response.forEach(function (data) {
                        var createdTime = new Date(data.created_time);
                        var currentTime = new Date();
                        var timeDifference = currentTime - createdTime;
                        var hoursDifference = Math.abs(timeDifference / (1000 * 60 * 60));

                        var actionButtons = `
                            <button class="btn btn-primary update-btn" data-id="${data.registration_main_id}">Update</button>
                            <button class="btn btn-danger delete-btn" data-id="${data.registration_main_id}">Delete</button>
                        `;
                        if (hoursDifference > 24) {
                            actionButtons = `
                                <button class="btn btn-primary" disabled>Update</button>
                                <button class="btn btn-danger" disabled>Delete</button>
                            `;
                        }

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
                                <td>${actionButtons}</td>
                            </tr>
                        `);
                    });

                    $('.container').show();
                    $('#example').DataTable();
                } else {
                    console.error('Invalid response format or no data found:', response);
                }
            },
            error: function (xhr, status, error) {
                console.error('Error fetching data:', error);
            },
        });
    }

    // Call the function to fetch data and populate the table
    fetchDataAndPopulateTable();

    // Delete button click event
    $(document).on('click', '.delete-btn', function () {
        var registration_main_id = $(this).data('id');

        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                $.ajax({
                    url: 'https://glexas.com/hostel_data/API/raj/new_admission_crud.php',
                    method: 'DELETE',
                    data: JSON.stringify({ registration_main_id: registration_main_id }),
                    success: function (response) {
                        if (response.status && response.status === true) {
                            swal("Success!", response.message, "success");
                            fetchDataAndPopulateTable();
                        } else {
                            swal("Error!", response.message, "error");
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error('Error deleting record:', error);
                        swal("Error!", "Failed to delete record. Please try again later.", "error");
                    },
                });
            } else {
                swal("The record is safe!");
            }
        });
    });

    // Insert button click event
    $('#insertButton').click(function () {
        $("#insertModalLabel").text("Insert Record");
        $('#registrationMainId').closest('.form-group').hide();
        $("#Click").text("Insert");
        $('#insertForm').show();
        $('#updateForm').hide();
        $('#insertModal').modal('toggle');
    });

    // Close modal button click event
    $(document).on('click', '.modal .close', function () {
        $(this).closest('.modal').modal('hide');
        $('form').each(function () {
            this.reset();
        });
    });

    // Update button click event
    $(document).on('click', '.update-btn', function () {
        $("#insertModalLabel").text("Update Record");
        $("#Click").text("Update");
        $('#registrationMainId').closest('.form-group').show();
        $('#insertForm').hide();
        $('#updateForm').show();

        var registration_main_id = $(this).data('id');

        $.ajax({
            url: 'https://glexas.com/hostel_data/API/raj/new_admission_crud.php',
            method: 'GET',
            success: function (response) {
                if (response.status && response.status === true && Array.isArray(response.response)) {
                    var data = response.response.find(function (record) {
                        return String(record.registration_main_id) === String(registration_main_id);
                    });

                    if (data) {
                        $('#registrationMainId').val(data.registration_main_id);
                        $('#userCode').val(data.user_code);
                        $('#firstName').val(data.first_name);
                        $('#middleName').val(data.middle_name);
                        $('#lastName').val(data.last_name);
                        $('#phoneNumber').val(data.phone_number);
                        $('#email').val(data.email);

                        $('#insertModal').modal('show');
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
            },
        });
    });

    // Close the modal when it is hidden
    $('#insertModal').on('hidden.bs.modal', function () {
        $(this).find('form')[0].reset();
    });

    // Function to handle form submission for inserting or updating data
    function handleFormSubmission(form, method) {
        const fullPhoneNumber = iti.getNumber();
        const selectedCountryData = iti.getSelectedCountryData();
        const countryCode = selectedCountryData.dialCode;
        const phoneNumberWithoutCountryCode = fullPhoneNumber.replace(`+${countryCode}`, '');

        var formData = $(form).serialize();
        formData += `&phone_country_code=${countryCode}&phone_number=${phoneNumberWithoutCountryCode}`;

        $.ajax({
            url: 'https://glexas.com/hostel_data/API/raj/new_admission_crud.php',
            method: method,
            data: formData,
            success: function (response) {
                if (response.status && response.status === true) {
                    $('#insertModal').modal('hide');
                    swal("Success!", response.message, "success");
                    fetchDataAndPopulateTable();
                } else {
                    swal("Error!", response.message, "error");
                }
            },
            error: function (xhr, status, error) {
                console.error(`Error ${method === 'POST' ? 'inserting' : 'updating'} data:`, error);
                swal("Error!", `Failed to ${method === 'POST' ? 'insert' : 'update'} data. Please try again later.`, "error");
            },
        });
    }

    // Handle form submission for inserting data
    $(document).on('submit', '#insertForm', function (event) {
        event.preventDefault();
        handleFormSubmission(this, 'POST');
    });

    // Handle form submission for updating data
    $(document).on('submit', '#updateForm', function (event) {
        event.preventDefault();
        handleFormSubmission(this, 'PUT');
    });
});
